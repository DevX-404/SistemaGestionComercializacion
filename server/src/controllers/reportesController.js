const { connectMySQL, poolPg } = require('../config/databases');

const getReportes = async (req, res) => {
    try {
        const conn = await connectMySQL();
        
        // --- REPORTE 1: Ventas de los últimos 7 días (MySQL) ---
        // Agrupa por fecha y suma los totales.
        const [ventasPorFecha] = await conn.execute(`
            SELECT DATE_FORMAT(fecha_emision, '%d/%m') as fecha, SUM(total) as total
            FROM ventas_cabecera
            WHERE fecha_emision >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE_FORMAT(fecha_emision, '%d/%m')
            ORDER BY MIN(fecha_emision) ASC 
        `);

        // --- REPORTE 2: Estado de Cartera de Créditos (MySQL) ---
        // Compara cuánto han pagado vs cuánto deben.
        const [creditos] = await conn.execute(`
            SELECT 
                SUM(monto_pagado) as pagado,
                SUM(saldo_pendiente) as deuda
            FROM cuentas_por_cobrar
        `);

        // --- REPORTE 3: Productos con Stock Crítico (PostgreSQL) ---
        // Consulta directa a logística para ver qué falta comprar.
        const { rows: stockBajo } = await poolPg.query(`
            SELECT producto_sku, stock_actual, stock_minimo 
            FROM inventario_resumen 
            WHERE stock_actual <= stock_minimo
        `);

        conn.end();

        res.json({
            ventas_chart: ventasPorFecha,
            deuda_chart: creditos[0],
            stock_alerta: stockBajo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generando reportes' });
    }
};

module.exports = { getReportes };