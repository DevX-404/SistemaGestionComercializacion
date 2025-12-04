const { poolPg } = require('../config/databases');

const agregarStock = async (req, res) => {
    const { proveedor_id, numero_documento, items } = req.body; 
    // items es un array: [{ sku, cantidad, costo_unitario }, ...]

    const client = await poolPg.connect();

    try {
        // 1. INICIAR TRANSACCIÓN (Modo Serio)
        await client.query('BEGIN');

        for (const item of items) {
            // A. Actualizar Stock y Costo Promedio
            // (El costo promedio se recalcula ponderado en sistemas reales, aquí simplificamos actualizando)
            await client.query(
                `UPDATE inventario_resumen 
                 SET stock_actual = stock_actual + $1, costo_promedio = $2 
                 WHERE producto_sku = $3`,
                [item.cantidad, item.costo_unitario, item.sku]
            );

            // B. Recuperar stock final para Kardex
            const resStock = await client.query(
                'SELECT stock_actual FROM inventario_resumen WHERE producto_sku = $1', 
                [item.sku]
            );
            const stockFinal = resStock.rows[0]?.stock_actual || 0;

            // C. Insertar en Kardex
            await client.query(
                `INSERT INTO kardex_movimientos 
                (producto_sku, almacen_id, tipo_movimiento, cantidad, costo_unitario, saldo_stock_resultante, referencia_documento)
                VALUES ($1, 1, 'COMPRA', $2, $3, $4, $5)`,
                [item.sku, item.cantidad, item.costo_unitario, stockFinal, `PROV-${proveedor_id} | DOC: ${numero_documento}`]
            );
        }

        // 2. CONFIRMAR CAMBIOS
        await client.query('COMMIT');
        res.json({ message: 'Ingreso masivo registrado correctamente' });

    } catch (error) {
        await client.query('ROLLBACK'); // Si falla algo, deshacer todo
        console.error(error);
        res.status(500).json({ error: 'Error en transacción de ingreso' });
    } finally {
        client.release();
    }
};

module.exports = { agregarStock };