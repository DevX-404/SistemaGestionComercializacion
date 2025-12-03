const dashboardService = require('../services/DashboardService');
const { connectMySQL } = require('../config/databases');

const obtenerKPIs = async (req, res) => {
    try {
        const datos = await dashboardService.obtenerResumen();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo datos del dashboard' });
    }

    try {
        const resultados = { ventasHoy: 0, creditosPendientes: 0, productosBajoStock: 0, totalProductos: 0 };
        
        // 1. MySQL
        const mysql = await connectMySQL();
        const [ventas] = await mysql.execute("SELECT SUM(total) as total FROM ventas_cabecera WHERE DATE(fecha_emision) = CURDATE() AND estado = 'COMPLETADO'");
        resultados.ventasHoy = ventas[0].total || 0;
        
        const [deudas] = await mysql.execute("SELECT SUM(saldo_pendiente) as total FROM cuentas_por_cobrar WHERE estado != 'PAGADO'");
        resultados.creditosPendientes = deudas[0].total || 0;
        await mysql.end();

        // 2. Postgres
        const stockQuery = await poolPg.query("SELECT COUNT(*) as total FROM inventario_resumen WHERE stock_actual <= stock_minimo");
        resultados.productosBajoStock = parseInt(stockQuery.rows[0].total);

        // 3. Mongo
        resultados.totalProductos = await Producto.countDocuments();

        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error KPIs' });
    }
};

// --- FUNCIÓN CORREGIDA DEL GRÁFICO ---
const obtenerVentasSemana = async (req, res) => {
    try {
        const connection = await connectMySQL();
        
        // CORRECCIÓN SQL:
        // 1. Usamos DATE_SUB en lugar de la resta directa.
        // 2. Hacemos GROUP BY exactamente por la misma expresión del SELECT para evitar error de 'only_full_group_by'
        const query = `
            SELECT 
                DATE_FORMAT(fecha_emision, '%Y-%m-%d') as fecha,
                SUM(total) as total
            FROM ventas_cabecera
            WHERE fecha_emision >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND estado = 'COMPLETADO'
            GROUP BY DATE_FORMAT(fecha_emision, '%Y-%m-%d')
            ORDER BY fecha ASC
        `;

        const [rows] = await connection.execute(query);
        await connection.end();

        res.json(rows);

    } catch (error) {
        console.error("Error en Gráfico:", error.message); // Verás el error real en la terminal del servidor
        res.status(500).json({ message: 'Error al generar gráfico de ventas' });
    }
};

module.exports = { obtenerKPIs, obtenerVentasSemana };