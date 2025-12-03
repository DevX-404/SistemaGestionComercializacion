const { connectMySQL, poolPg } = require('../config/databases');

class VentasService {

    async crearNuevaVenta(datosVenta) {
        const { cliente_id, usuario_id, items, tipo_pago, total, cuotas } = datosVenta;
        
        let connectionMySQL;

        try {
            console.log('🔄 Iniciando proceso de venta...');

            // ---------------------------------------------------------
            // 1. VALIDACIÓN PREVIA (PostgreSQL - Logística)
            // Verificamos si hay stock real antes de intentar cobrar
            // ---------------------------------------------------------
            for (const item of items) {
                const stockQuery = 'SELECT stock_actual FROM inventario_resumen WHERE producto_sku = $1';
                const stockRes = await poolPg.query(stockQuery, [item.sku]);

                if (stockRes.rows.length === 0) {
                    throw new Error(`El producto ${item.sku} no existe en inventario.`);
                }
                
                if (stockRes.rows[0].stock_actual < item.cantidad) {
                    throw new Error(`Stock insuficiente para ${item.sku}. Disponibles: ${stockRes.rows[0].stock_actual}`);
                }
            }

            // ---------------------------------------------------------
            // 2. INICIAR TRANSACCIÓN (MySQL - Ventas)
            // Guardamos la información financiera
            // ---------------------------------------------------------
            connectionMySQL = await connectMySQL();
            await connectionMySQL.beginTransaction();

            // A. Insertar la Cabecera de la Venta
            const subtotal = total / 1.18;
            const igv = total - subtotal;

            const [resultCabecera] = await connectionMySQL.execute(
                `INSERT INTO ventas_cabecera 
                (cliente_id, usuario_id, tipo_pago, subtotal, igv, total) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [cliente_id, usuario_id, tipo_pago, subtotal, igv, total]
            );
            
            const ventaId = resultCabecera.insertId;

            // B. Insertar cada producto en el Detalle
            for (const item of items) {
                await connectionMySQL.execute(
                    `INSERT INTO ventas_detalle 
                    (venta_id, producto_sku, cantidad, precio_unitario, subtotal) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [ventaId, item.sku, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]
                );
            }

            // --- C. LÓGICA DE CRÉDITO (AQUÍ ESTÁ EL CAMBIO IMPORTANTE) ---
            if (tipo_pago === 'CREDITO') {
                const numCuotas = cuotas || 1; // Si no envían cuotas, asumimos 1
                const montoPorCuota = total / numCuotas;
                
                // 1. Crear la Cuenta por Cobrar General
                const [cuentaResult] = await connectionMySQL.execute(
                    `INSERT INTO cuentas_por_cobrar 
                    (venta_id, monto_total, saldo_pendiente, fecha_vencimiento, cuotas_totales, estado) 
                    VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), ?, 'PENDIENTE')`,
                    [ventaId, total, total, numCuotas]
                );
                const cuentaId = cuentaResult.insertId;

                // 2. Generar el Cronograma (Bucle para las 12 cuotas)
                for (let i = 1; i <= numCuotas; i++) {
                    const diasSumar = i * 30; // 30, 60, 90 días...
                    
                    await connectionMySQL.execute(
                        `INSERT INTO cronograma_pagos 
                        (cuenta_id, numero_cuota, monto_cuota, fecha_vencimiento)
                        VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
                        [cuentaId, i, montoPorCuota, diasSumar]
                    );
                }
                console.log(`📅 Se generó un cronograma de ${numCuotas} cuotas.`);
            }

            // ---------------------------------------------------------
            // 3. ACTUALIZAR LOGÍSTICA (PostgreSQL)
            // Descargamos el stock y actualizamos el Kardex
            // ---------------------------------------------------------
            for (const item of items) {
                // A. Restar Stock Físico
                await poolPg.query(
                    'UPDATE inventario_resumen SET stock_actual = stock_actual - $1 WHERE producto_sku = $2',
                    [item.cantidad, item.sku]
                );

                // B. Registrar en KARDEX (Historial)
                const stockFinalRes = await poolPg.query('SELECT stock_actual FROM inventario_resumen WHERE producto_sku = $1', [item.sku]);
                const stockFinal = stockFinalRes.rows[0].stock_actual;

                await poolPg.query(
                    `INSERT INTO kardex_movimientos 
                    (producto_sku, almacen_id, tipo_movimiento, cantidad, saldo_stock_resultante, referencia_documento)
                    VALUES ($1, 1, 'VENTA', $2, $3, $4)`,
                    [item.sku, -item.cantidad, stockFinal, `VENTA-${ventaId}`]
                );
            }

            // ---------------------------------------------------------
            // 4. FINALIZAR
            // ---------------------------------------------------------
            await connectionMySQL.commit();
            console.log('✅ Venta finalizada con éxito. ID:', ventaId);
            
            return { 
                success: true, 
                mensaje: 'Venta registrada correctamente', 
                id_venta: ventaId 
            };

        } catch (error) {
            // Si falla algo (ej: error en Postgres), deshacemos lo de MySQL
            if (connectionMySQL) await connectionMySQL.rollback();
            console.error('❌ Error en servicio de ventas:', error.message);
            throw error;
        } finally {
            if (connectionMySQL) connectionMySQL.end();
        }
    }
}

module.exports = new VentasService();