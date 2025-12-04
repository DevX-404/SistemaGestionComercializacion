const dashboardService = require('../services/DashboardService');
const { connectMySQL } = require('../config/databases');

// 1. Obtener Tarjetas de Resumen (KPIs)
const obtenerKPIs = async (req, res) => {
    try {
        // Delegamos la lógica compleja al servicio
        const datos = await dashboardService.obtenerResumen();
        
        // Respondemos UNA SOLA VEZ
        res.json(datos);
        
    } catch (error) {
        console.error("Error en KPIs Controller:", error);
        // Evitar error de doble respuesta si falla algo
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error obteniendo datos del dashboard' });
        }
    }
};

// 2. Obtener Datos para el Gráfico
const obtenerVentasSemana = async (req, res) => {
    try {
        const connection = await connectMySQL();
        
        // Consulta agrupada por día (Últimos 7 días)
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
        console.error("Error en Gráfico Controller:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al generar gráfico de ventas' });
        }
    }
};

module.exports = { obtenerKPIs, obtenerVentasSemana };