const { connectMySQL, poolPg } = require('../config/databases');
const Producto = require('../models/nosql/Producto');

class DashboardService {

    async obtenerResumen() {
        const resultados = {
            ventasHoy: 0,
            creditosPendientes: 0,
            productosBajoStock: 0,
            totalProductos: 0,
            topProductos: [], // Nuevo
            actividadReciente: [] // Nuevo
        };

        try {
            const mysql = await connectMySQL();

            // 1. KPIs Básicos (Igual que antes)
            const [ventas] = await mysql.execute("SELECT SUM(total) as total FROM ventas_cabecera WHERE DATE(fecha_emision) = CURDATE() AND estado = 'COMPLETADO'");
            resultados.ventasHoy = ventas[0].total || 0;
            
            const [deudas] = await mysql.execute("SELECT SUM(saldo_pendiente) as total FROM cuentas_por_cobrar WHERE estado != 'PAGADO'");
            resultados.creditosPendientes = deudas[0].total || 0;

            if (poolPg) {
                const stockQuery = await poolPg.query("SELECT COUNT(*) as total FROM inventario_resumen WHERE stock_actual <= stock_minimo");
                resultados.productosBajoStock = parseInt(stockQuery.rows[0].total);
            }

            resultados.totalProductos = await Producto.countDocuments({ estado: 'ACTIVO' });

            // --- NUEVO: TOP 5 PRODUCTOS MÁS VENDIDOS ---
            // Consultamos MySQL (Detalle de ventas)
            const [top] = await mysql.execute(`
                SELECT producto_sku as sku, SUM(cantidad) as total_vendido 
                FROM ventas_detalle vd
                JOIN ventas_cabecera vc ON vd.venta_id = vc.id
                WHERE vc.estado = 'COMPLETADO'
                GROUP BY producto_sku
                ORDER BY total_vendido DESC
                LIMIT 5
            `);
            resultados.topProductos = top;

            // --- NUEVO: ACTIVIDAD RECIENTE (FEED) ---
            // A. Últimas 3 Ventas
            const [ultimasVentas] = await mysql.execute(`
                SELECT 'VENTA' as tipo, id, total as monto, fecha_emision as fecha 
                FROM ventas_cabecera ORDER BY id DESC LIMIT 3
            `);

            // B. Últimos 3 Ingresos (Postgres)
            let ultimosIngresos = [];
            if(poolPg) {
                const { rows } = await poolPg.query(`
                    SELECT 'COMPRA' as tipo, id, referencia_documento as ref, fecha_movimiento as fecha 
                    FROM kardex_movimientos WHERE tipo_movimiento = 'COMPRA' 
                    ORDER BY id DESC LIMIT 3
                `);
                ultimosIngresos = rows;
            }

            // C. Mezclar y ordenar por fecha (feed unificado)
            const feed = [...ultimasVentas, ...ultimosIngresos]
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 6); // Solo los 6 más recientes

            resultados.actividadReciente = feed;

            await mysql.end();
            return resultados;

        } catch (error) {
            console.error('Error en DashboardService:', error);
            throw error;
        }
    }
}

module.exports = new DashboardService();