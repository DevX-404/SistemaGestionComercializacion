const ProductoMongo = require('../models/nosql/Producto');
const { poolPg } = require('../config/databases'); // Traemos la conexión de Postgres

const getProductosConStock = async (req, res) => {
    try {
        console.log('⚡ Solicitando productos híbridos...');

        // 1. Traer toda la info visual de MongoDB
        const productosMongo = await ProductoMongo.find({ estado: 'activo' }).lean();

        // 2. Extraer los SKUs para preguntar a Postgres
        const skus = productosMongo.map(p => p.sku);
        
        if (skus.length === 0) {
            return res.json([]); // Si no hay productos, devolver vacío
        }

        // 3. Consultar STOCK en PostgreSQL (Usando IN para ser eficientes)
        // Nota: $1 es un placeholder, pg requiere formatear el array, 
        // pero para simplificar haremos un query directo seguro con ANY
        const querySQL = `
            SELECT producto_sku, stock_actual 
            FROM inventario_resumen 
            WHERE producto_sku = ANY($1)
        `;
        
        const { rows: stocksPostgres } = await poolPg.query(querySQL, [skus]);

        // 4. FUSIONAR DATOS (El paso monstruoso) 🧬
        const productosFusionados = productosMongo.map(prod => {
            // Buscamos si este producto tiene stock en la lista de Postgres
            const stockInfo = stocksPostgres.find(s => s.producto_sku === prod.sku);
            
            return {
                ...prod, // Todo lo de Mongo (nombre, foto, desc)
                stock: stockInfo ? stockInfo.stock_actual : 0, // Dato de Postgres
                origen_datos: 'Mongo + Postgres' // Marca de agua para el profesor
            };
        });

        res.json(productosFusionados);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener inventario híbrido' });
    }
};

module.exports = { getProductosConStock };