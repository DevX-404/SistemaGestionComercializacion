const { poolPg } = require('../config/databases');

const getKardex = async (req, res) => {
    try {
        // Consulta a PostgreSQL para traer el historial ordenado por fecha
        const query = `
            SELECT 
                k.id,
                k.producto_sku,
                k.fecha_movimiento,
                k.tipo_movimiento,
                k.cantidad,
                k.saldo_stock_resultante,
                k.referencia_documento
            FROM kardex_movimientos k
            ORDER BY k.fecha_movimiento DESC
        `;
        const { rows } = await poolPg.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getKardex };