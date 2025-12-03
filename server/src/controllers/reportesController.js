const { connectMySQL } = require('../config/databases');

const obtenerVentasPorFecha = async (req, res) => {
    try {
        const { inicio, fin } = req.query;

        if (!inicio || !fin) {
            return res.status(400).json({ message: 'Faltan fechas inicio o fin' });
        }

        const connection = await connectMySQL();
        
        // Consulta maestra: Venta + Cliente + Usuario
        const [rows] = await connection.execute(`
            SELECT 
                v.id, 
                v.fecha_emision, 
                c.razon_social AS cliente, 
                c.numero_documento,
                v.tipo_pago, 
                v.total,
                v.usuario_id
            FROM ventas_cabecera v
            JOIN clientes c ON v.cliente_id = c.id
            WHERE DATE(v.fecha_emision) BETWEEN ? AND ?
            ORDER BY v.fecha_emision DESC
        `, [inicio, fin]);

        await connection.end();
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar reporte' });
    }
};

module.exports = { obtenerVentasPorFecha };