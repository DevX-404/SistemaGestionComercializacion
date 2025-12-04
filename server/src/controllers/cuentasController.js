const { connectMySQL } = require('../config/databases');

// Obtener todas las cuentas por cobrar con datos del cliente
const listarCuentas = async (req, res) => {
    try {
        const connection = await connectMySQL();
        
        // Esta consulta une 3 tablas para darte toda la info completa
        const [rows] = await connection.execute(`
            SELECT 
                cc.id,
                c.razon_social AS cliente,
                c.numero_documento AS ruc_dni,
                vc.fecha_emision,
                cc.monto_total,
                cc.saldo_pendiente,
                cc.fecha_vencimiento,
                cc.estado
            FROM cuentas_por_cobrar cc
            INNER JOIN ventas_cabecera vc ON cc.venta_id = vc.id
            INNER JOIN clientes c ON vc.cliente_id = c.id
            ORDER BY cc.fecha_vencimiento ASC
        `);

        await connection.end(); // Cerramos conexión para no saturar
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener cuentas por cobrar' });
    }
};

// NUEVO: Obtener detalle de cuotas de una deuda
const verCronograma = async (req, res) => {
    try {
        const { id } = req.params; // ID de la cuenta por cobrar
        const connection = await connectMySQL();
        const [rows] = await connection.execute(
            `SELECT * FROM cronograma_pagos WHERE cuenta_id = ? ORDER BY numero_cuota ASC`, 
            [id]
        );
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// NUEVO: Pagar una cuota específica
const pagarCuota = async (req, res) => {
    const { idCuota, idCuenta, monto } = req.body; // ID del cronograma
    const connection = await connectMySQL();
    
    try {
        await connection.beginTransaction();

        // 1. Marcar la cuota como PAGADA
        await connection.execute(
            `UPDATE cronograma_pagos SET estado = 'PAGADO', fecha_pago = NOW() WHERE id = ?`,
            [idCuota]
        );

        // 2. Restar el monto de la deuda global
        await connection.execute(
            `UPDATE cuentas_por_cobrar 
             SET saldo_pendiente = saldo_pendiente - ?, 
                 monto_pagado = monto_pagado + ? 
             WHERE id = ?`,
            [monto, monto, idCuenta]
        );

        // 3. Verificar si ya pagó todo para cerrar la cuenta maestra
        const [check] = await connection.execute('SELECT saldo_pendiente FROM cuentas_por_cobrar WHERE id = ?', [idCuenta]);
        if (check[0].saldo_pendiente <= 0.50) { // Margen de error por decimales
            await connection.execute("UPDATE cuentas_por_cobrar SET estado = 'PAGADO' WHERE id = ?", [idCuenta]);
        }

        await connection.commit();
        res.json({ message: 'Cuota pagada con éxito' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    }
};

// Obtener detalle de UNA cuenta específica (Cabecera)
const obtenerDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await connectMySQL();
        
        const [rows] = await connection.execute(`
            SELECT 
                cc.id, cc.monto_total, cc.monto_pagado, cc.saldo_pendiente, 
                cc.estado, cc.cuotas_totales,
                c.razon_social AS cliente, c.numero_documento, c.direccion, c.telefono,
                vc.fecha_emision, vc.id AS venta_id
            FROM cuentas_por_cobrar cc
            JOIN ventas_cabecera vc ON cc.venta_id = vc.id
            JOIN clientes c ON vc.cliente_id = c.id
            WHERE cc.id = ?
        `, [id]);

        await connection.end();
        
        if (rows.length === 0) return res.status(404).json({ message: 'Crédito no encontrado' });
        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const consultarPorDocumento = async (req, res) => {
    try {
        const { documento } = req.body;
        const connection = await connectMySQL();

        // 1. Buscar Cliente y sus Cuentas Pendientes
        const [cuentas] = await connection.execute(`
            SELECT 
                cc.id, cc.monto_total, cc.saldo_pendiente, 
                vc.fecha_emision, 
                c.razon_social as cliente
            FROM cuentas_por_cobrar cc
            JOIN ventas_cabecera vc ON cc.venta_id = vc.id
            JOIN clientes c ON vc.cliente_id = c.id
            WHERE c.numero_documento = ? AND cc.estado != 'PAGADO'
        `, [documento]);

        if (cuentas.length === 0) {
            await connection.end();
            return res.json({ encontrado: false, mensaje: 'No se encontraron deudas pendientes.' });
        }

        // 2. Para cada cuenta, buscar sus cuotas pendientes y CALCULAR INTERÉS
        const resultados = [];

        for (const cuenta of cuentas) {
            const [cuotas] = await connection.execute(`
                SELECT * FROM cronograma_pagos 
                WHERE cuenta_id = ? AND estado != 'PAGADO'
                ORDER BY fecha_vencimiento ASC
            `, [cuenta.id]);

            // Lógica de Interés (1 Sol por semana de retraso)
            const cuotasConInteres = cuotas.map(cuota => {
                const fechaVenc = new Date(cuota.fecha_vencimiento);
                const hoy = new Date();
                let interes = 0;
                let diasRetraso = 0;

                if (hoy > fechaVenc) {
                    const diffTime = Math.abs(hoy - fechaVenc);
                    diasRetraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    const semanas = Math.floor(diasRetraso / 7);
                    if (semanas > 0) {
                        interes = semanas * 1.00; // 1 Sol por semana
                    }
                }

                return {
                    ...cuota,
                    dias_retraso: diasRetraso,
                    interes_mora: interes.toFixed(2),
                    total_a_pagar: (parseFloat(cuota.monto_cuota) + interes).toFixed(2)
                };
            });

            resultados.push({
                ...cuenta,
                cuotas: cuotasConInteres
            });
        }

        await connection.end();
        res.json({ encontrado: true, cliente: cuentas[0].cliente, cuentas: resultados });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error consultando deudas' });
    }
};

// NUEVO: Pago Público (Desde la Web del Cliente)
const pagarCuotaPublica = async (req, res) => {
    const { idCuota, idCuenta, monto } = req.body;
    const connection = await connectMySQL();
    
    try {
        await connection.beginTransaction();

        // 1. Marcar cuota como pagada (Fecha actual)
        await connection.execute(
            "UPDATE cronograma_pagos SET estado = 'PAGADO', fecha_pago = NOW() WHERE id = ?",
            [idCuota]
        );

        // 2. Actualizar saldo en la cuenta principal
        await connection.execute(
            `UPDATE cuentas_por_cobrar 
             SET monto_pagado = monto_pagado + ?, 
                 saldo_pendiente = saldo_pendiente - ? 
             WHERE id = ?`,
            [monto, monto, idCuenta]
        );

        // 3. Verificar si se liquidó la deuda completa
        const [check] = await connection.execute(
            "SELECT saldo_pendiente FROM cuentas_por_cobrar WHERE id = ?", 
            [idCuenta]
        );
        
        if (check[0].saldo_pendiente <= 0.5) { // Tolerancia de centavos
             await connection.execute(
                 "UPDATE cuentas_por_cobrar SET estado = 'PAGADO' WHERE id = ?", 
                 [idCuenta]
             );
        }

        // 4. Registrar movimiento en tabla de pagos (Opcional para auditoría)
        // await connection.execute("INSERT INTO pagos_credito ...") 

        await connection.commit();
        res.json({ success: true, message: 'Pago procesado exitosamente' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        await connection.end();
    }
};

module.exports = { listarCuentas, verCronograma, pagarCuota, obtenerDetalle, consultarPorDocumento, pagarCuotaPublica }; 