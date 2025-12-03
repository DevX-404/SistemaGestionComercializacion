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

module.exports = { listarCuentas, verCronograma, pagarCuota }; 