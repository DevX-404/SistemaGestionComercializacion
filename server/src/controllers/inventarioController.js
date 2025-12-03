const { poolPg } = require('../config/databases');

// Registrar Ingreso de Mercadería (COMPRA)
const agregarStock = async (req, res) => {
    const { sku, cantidad, costo_unitario, proveedor_id } = req.body;

    try {
        // 1. Actualizar Stock Físico (Tabla Resumen)
        await poolPg.query(
            `UPDATE inventario_resumen 
             SET stock_actual = stock_actual + $1, 
                 costo_promedio = $2 
             WHERE producto_sku = $3`,
            [cantidad, costo_unitario, sku]
        );

        // 2. Recuperar stock actual para el Kardex
        const stockRes = await poolPg.query(
            'SELECT stock_actual FROM inventario_resumen WHERE producto_sku = $1', 
            [sku]
        );
        const stockFinal = stockRes.rows[0].stock_actual;

        // 3. Insertar en KARDEX (Historial)
        await poolPg.query(
            `INSERT INTO kardex_movimientos 
            (producto_sku, almacen_id, tipo_movimiento, cantidad, costo_unitario, saldo_stock_resultante, referencia_documento)
            VALUES ($1, 1, 'COMPRA', $2, $3, $4, $5)`,
            [sku, cantidad, costo_unitario, stockFinal, `PROV-${proveedor_id}`]
        );

        res.json({ message: 'Stock actualizado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error registrando ingreso' });
    }
};

module.exports = { agregarStock };