const { connectMySQL, connectPostgres, connectMongo } = require('../config/databases');
const Producto = require('../models/nosql/Producto'); // Modelo Mongo

class DashboardService {

    async obtenerResumen() {
        const resultados = {
            ventasHoy: 0,
            creditosPendientes: 0,
            productosBajoStock: 0,
            totalProductos: 0
        };

        try {
            // 1. MySQL: Ventas del día y Créditos
            const mysql = await connectMySQL();
            
            // A. Sumar ventas de hoy
            const [ventas] = await mysql.execute(`
                SELECT SUM(total) as total 
                FROM ventas_cabecera 
                WHERE DATE(fecha_emision) = CURDATE() AND estado = 'COMPLETADO'
            `);
            resultados.ventasHoy = ventas[0].total || 0;

            // B. Sumar deuda pendiente
            const [deudas] = await mysql.execute(`
                SELECT SUM(saldo_pendiente) as total 
                FROM cuentas_por_cobrar 
                WHERE estado != 'PAGADO'
            `);
            resultados.creditosPendientes = deudas[0].total || 0;
            await mysql.end();

            // 2. PostgreSQL: Productos con stock bajo (Alerta Logística)
            // Usamos poolPg directamente (asegúrate de importarlo en databases.js o usar el getter)
            const { poolPg } = require('../config/databases'); 
            const stockQuery = await poolPg.query(`
                SELECT COUNT(*) as total 
                FROM inventario_resumen 
                WHERE stock_actual <= stock_minimo
            `);
            resultados.productosBajoStock = parseInt(stockQuery.rows[0].total);

            // 3. MongoDB: Total de productos en catálogo
            // No necesitamos conectar explícitamente si ya se conectó al inicio en index.js
            resultados.totalProductos = await Producto.countDocuments();

            return resultados;

        } catch (error) {
            console.error('Error en DashboardService:', error);
            throw error;
        }
    }
}

module.exports = new DashboardService();