const { connectPostgres } = require('../config/databases');
const ProductoMongo = require('../models/nosql/Producto'); // Tu modelo de Mongo

class ProductoService {

    // Crear un producto nuevo (El sistema se encarga de distribuir los datos)
    async crearProducto(datos) {
        const { sku, nombre, precio, stock_inicial, descripcion, categoria } = datos;
        const poolPg = await connectPostgres(); // Conexión a Postgres

        // 1. Verificación de seguridad: ¿Ya existe el SKU?
        // Revisamos en Mongo primero
        const existeMongo = await ProductoMongo.findOne({ sku });
        if (existeMongo) throw new Error(`El código SKU '${sku}' ya existe en el catálogo.`);

        // 2. Guardar Ficha Técnica en MongoDB (Datos "blandos")
        const nuevoProductoMongo = new ProductoMongo({
            sku,
            nombre,
            precio_base: precio,
            descripcion_corta: descripcion,
            specs: { categoria } // Puedes agregar más detalles aquí
        });
        await nuevoProductoMongo.save();

        try {
            // 3. Guardar Inventario en PostgreSQL (Datos "duros")
            // A. Insertar en tabla de stock físico
            await poolPg.query(
                `INSERT INTO inventario_resumen (producto_sku, almacen_id, stock_actual, costo_promedio) 
                 VALUES ($1, 1, $2, $3)`,
                [sku, stock_inicial, precio * 0.70] // Asumimos costo es 70% del precio por ahora
            );

            // B. Iniciar el Kardex (Historial)
            await poolPg.query(
                `INSERT INTO kardex_movimientos 
                (producto_sku, almacen_id, tipo_movimiento, cantidad, saldo_stock_resultante, referencia_documento)
                VALUES ($1, 1, 'INVENTARIO_INICIAL', $2, $2, 'APERTURA')`,
                [sku, stock_inicial]
            );

            return { success: true, mensaje: 'Producto creado y sincronizado en todas las bases de datos.' };

        } catch (error) {
            // SI FALLA POSTGRES, BORRAMOS DE MONGO PARA NO TENER DATOS HUEFANOS (Rollback manual)
            await ProductoMongo.deleteOne({ sku });
            throw new Error('Error al crear inventario en SQL: ' + error.message);
        }
    }

    // Listar productos (Uniendo datos de Mongo y Postgres)
    async listarTodo() {
        const poolPg = await connectPostgres();
        
        // 1. Traemos la info bonita de Mongo
        const productosMongo = await ProductoMongo.find({}, 'sku nombre precio_base imagenes');

        // 2. Traemos el stock de Postgres
        const resStock = await poolPg.query('SELECT producto_sku, stock_actual FROM inventario_resumen');
        
        // 3. Mezclamos (Esto es "Data Blending")
        const inventarioMap = {};
        resStock.rows.forEach(item => {
            inventarioMap[item.producto_sku] = item.stock_actual;
        });

        const resultadoFinal = productosMongo.map(prod => {
            return {
                sku: prod.sku,
                nombre: prod.nombre,
                precio: prod.precio_base,
                stock: inventarioMap[prod.sku] || 0, // Si no encuentra, pone 0
                imagen: prod.imagenes[0] || 'default.jpg'
            };
        });

        return resultadoFinal;
    }
}

module.exports = new ProductoService();