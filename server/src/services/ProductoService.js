const { connectMongo, poolPg } = require('../config/databases');
const Producto = require('../models/nosql/Producto'); // Asegúrate de tener este modelo Mongoose

class ProductoService {

    async crearProducto(datosProducto, archivoImagen) {
        const { sku, nombre, descripcion, precio, stock_inicial, categoria } = datosProducto;
        let session = null; // Para transacción en Mongo (opcional, pero recomendado)

        try {
            console.log('📦 Registrando nuevo producto:', sku);

            // ---------------------------------------------------------
            // 1. GUARDAR EN MONGODB (Catálogo e Imagen)
            // ---------------------------------------------------------
            // Preparamos la ruta de la imagen si existe
            const rutaImagen = archivoImagen ? `/img/${archivoImagen.filename}` : null;

            const nuevoProductoMongo = new Producto({
                sku,
                nombre,
                descripcion,
                precio_base: precio,
                imagenes: rutaImagen ? [rutaImagen] : [],
                specs: { categoria }, // Guardamos la categoría en specs o campo directo
                stock: stock_inicial // Dato redundante visual para el front rápido
            });

            await nuevoProductoMongo.save();
            console.log('✅ Guardado en MongoDB');

            // ---------------------------------------------------------
            // 2. GUARDAR EN POSTGRESQL (Logística y Stock Real)
            // ---------------------------------------------------------
            // A. Insertar en inventario_resumen (Stock actual)
            // Asumimos almacen_id = 1 por defecto
            const queryInventario = `
                INSERT INTO inventario_resumen (producto_sku, almacen_id, stock_actual, stock_minimo, costo_promedio)
                VALUES ($1, $2, $3, $4, $5)
            `;
            await poolPg.query(queryInventario, [sku, 1, stock_inicial, 5, precio * 0.8]); // Costo estimado al 80% del precio

            // B. Insertar en Kardex (El primer movimiento: INVENTARIO INICIAL)
            if (stock_inicial > 0) {
                const queryKardex = `
                    INSERT INTO kardex_movimientos 
                    (producto_sku, almacen_id, tipo_movimiento, cantidad, saldo_stock_resultante, referencia_documento)
                    VALUES ($1, $2, 'INVENTARIO_INICIAL', $3, $4, 'APERTURA')
                `;
                await poolPg.query(queryKardex, [sku, 1, stock_inicial, stock_inicial]);
            }
            console.log('✅ Guardado en PostgreSQL (Inventario + Kardex)');

            return { success: true, message: 'Producto creado en todas las bases de datos' };

        } catch (error) {
            console.error('❌ Error creando producto:', error);
            // Aquí idealmente haríamos rollback (borrar de Mongo si falló Postgres)
            // Por simplicidad académica, lanzamos el error.
            throw new Error('Error al sincronizar bases de datos: ' + error.message);
        }
    }

    async listarTodo() {
        // Para listar, leemos de Mongo que es más rápido para catálogos
        // Pero podríamos hacer un "enrich" con el stock real de Postgres si quisiéramos ser muy estrictos.
        return await Producto.find().sort({ createdAt: -1 });
    }
    
    async eliminar(sku) {
        // Eliminar de ambas BD
        await Producto.deleteOne({ sku });
        await poolPg.query('DELETE FROM inventario_resumen WHERE producto_sku = $1', [sku]);
        return { message: 'Producto eliminado' };
    }
}

module.exports = new ProductoService();