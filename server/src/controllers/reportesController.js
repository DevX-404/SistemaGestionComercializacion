const { connectMySQL } = require('../config/databases');
const Producto = require('../models/nosql/Producto');

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

// Resumen General (Dashboard de Reportes)
const obtenerResumenGeneral = async (req, res) => {
    try {
        const connection = await connectMySQL();

        // 1. Datos de MySQL (Transaccional y Clientes)
        const [ventasData] = await connection.execute(`
            SELECT 
                COUNT(*) as total_ventas, 
                COALESCE(SUM(total), 0) as ingreso_total 
            FROM ventas_cabecera
        `);

        const [clientesData] = await connection.execute(`SELECT COUNT(*) as total FROM clientes`);

        await connection.end();

        // 2. Datos de MongoDB (Catálogos)
        const totalProductos = await Producto.countDocuments();
        const totalProveedores = 0; // Placeholder

        // 3. Respuesta unificada
        res.json({
            kpis: {
                ingresos: ventasData[0].ingreso_total,
                ventas_cantidad: ventasData[0].total_ventas,
                clientes: clientesData[0].total,
                productos: totalProductos,
                proveedores: totalProveedores
            }
        });

    } catch (error) {
        console.error("Error resumen:", error);
        res.status(500).json({ message: 'Error obteniendo resumen' });
    }
};

module.exports = { obtenerVentasPorFecha, obtenerResumenGeneral };