const { connectMySQL, poolPg } = require('../config/databases');

const procesarVenta = async (req, res) => {
    // Recibimos datos del Frontend
    const { cliente_id, usuario_id, items, tipo_pago, total } = req.body;
    
    // items es un array: [{ sku: 'LAP-01', cantidad: 1, precio: 3500 }]

    let connectionMySQL;

    try {
        console.log(`⚡ Procesando Venta ${tipo_pago} para cliente ${cliente_id}`);

        // 1. INICIAR TRANSACCIÓN EN MYSQL (Para asegurar consistencia financiera)
        connectionMySQL = await connectMySQL();
        await connectionMySQL.beginTransaction();

        // ---------------------------------------------------------
        // PASO A: REGISTRAR VENTA EN MYSQL (Dinero)
        // ---------------------------------------------------------
        
        // A.1 Insertar Cabecera
        const [resultCabecera] = await connectionMySQL.execute(
            `INSERT INTO ventas_cabecera (cliente_id, usuario_id, tipo_pago, subtotal, igv, total) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [cliente_id, usuario_id, tipo_pago, total / 1.18, total - (total / 1.18), total]
        );
        const ventaId = resultCabecera.insertId;

        // A.2 Insertar Detalles (Producto por producto)
        for (const item of items) {
            await connectionMySQL.execute(
                `INSERT INTO ventas_detalle (venta_id, producto_sku, cantidad, precio_unitario, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [ventaId, item.sku, item.cantidad, item.precio_base, item.cantidad * item.precio_base]
            );
        }

        // A.3 SI ES CRÉDITO -> Generar Cuentas por Cobrar
        if (tipo_pago === 'CREDITO') {
            // Calculamos vencimiento a 30 días (ejemplo)
            const fechaVencimiento = new Date();
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

            await connectionMySQL.execute(
                `INSERT INTO cuentas_por_cobrar (venta_id, monto_total, saldo_pendiente, fecha_vencimiento) 
                 VALUES (?, ?, ?, ?)`,
                [ventaId, total, total, fechaVencimiento]
            );
            console.log('--- Deuda registrada en MySQL ---');
        }

        // ---------------------------------------------------------
        // PASO B: ACTUALIZAR INVENTARIO EN POSTGRESQL (Logística)
        // ---------------------------------------------------------
        
        for (const item of items) {
            // B.1 Restar Stock Físico
            const updateStockQuery = `
                UPDATE inventario_resumen 
                SET stock_actual = stock_actual - $1 
                WHERE producto_sku = $2
            `;
            await poolPg.query(updateStockQuery, [item.cantidad, item.sku]);

            // B.2 Registrar en KARDEX (CORREGIDO)
            // CAMBIO: Usamos $3 para el SKU dentro del SELECT para evitar confusión de tipos
            const insertKardexQuery = `
                INSERT INTO kardex_movimientos 
                (producto_sku, almacen_id, tipo_movimiento, cantidad, saldo_stock_resultante, referencia_documento)
                VALUES ($1, 1, 'VENTA', $2, (SELECT stock_actual FROM inventario_resumen WHERE producto_sku = $3), $4)
            `;
            
            // Fíjate que ahora pasamos item.sku dos veces (una para $1 y otra para $3)
            await poolPg.query(insertKardexQuery, [
                item.sku,               // $1
                -item.cantidad,         // $2 (Negativo porque sale)
                item.sku,               // $3 (Para buscar el saldo actual)
                `VENTA-${ventaId}`      // $4
            ]);
        }

        // Si todo salió bien en ambas BDs:
        await connectionMySQL.commit(); // Confirmar cambios en MySQL
        
        console.log('✅ Venta procesada exitosamente');
        res.status(200).json({ 
            mensaje: 'Venta procesada correctamente', 
            venta_id: ventaId,
            tipo: tipo_pago
        });

    } catch (error) {
        // Si algo falla, deshacer todo en MySQL
        if (connectionMySQL) await connectionMySQL.rollback();
        console.error('❌ Error en venta:', error);
        res.status(500).json({ error: 'Error procesando la venta: ' + error.message });
    } finally {
        if (connectionMySQL) connectionMySQL.end(); // Cerrar conexión
    }
};

module.exports = { procesarVenta };