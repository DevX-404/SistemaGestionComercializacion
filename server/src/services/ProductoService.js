const { connectMongo, poolPg } = require('../config/databases');
const Producto = require('../models/nosql/Producto'); 

class ProductoService {

    async crearProducto(datosProducto, archivoImagen) {
        // 1. CONVERTIR DATOS (Importante para evitar Error 500)
        const sku = datosProducto.sku.toUpperCase();
        const precio = parseFloat(datosProducto.precio); // Convertir "50.00" a 50.00
        const stock_inicial = parseInt(datosProducto.stock_inicial) || 0;
        const categoria = datosProducto.categoria;
        const nombre = datosProducto.nombre;
        const descripcion = datosProducto.descripcion;

        const rutaImagen = archivoImagen ? `/img/${archivoImagen.filename}` : null;

        // 2. VALIDAR CATEGORÍA (Opcional, pero recomendado)
        if (!categoria || categoria === 'undefined') {
            throw new Error('Debe seleccionar una categoría válida');
        }

        // 3. GUARDAR EN MONGO
        const nuevoProductoMongo = new Producto({
            sku, 
            nombre, 
            descripcion, 
            precio_base: precio,
            imagenes: rutaImagen ? [rutaImagen] : [],
            categoria: datosProducto.categoria,
            stock: stock_inicial,
            estado: 'ACTIVO'
        });
        await nuevoProductoMongo.save();

        // 4. GUARDAR EN POSTGRESQL
        // Usamos try-catch interno para dar error específico si falla SQL
        try {
            await poolPg.query(
                'INSERT INTO inventario_resumen (producto_sku, almacen_id, stock_actual, stock_minimo, costo_promedio) VALUES ($1, 1, $2, 5, $3)',
                [sku, stock_inicial, precio * 0.8]
            );
        } catch (sqlError) {
            // Si falla Postgres, borramos de Mongo para no dejar basura (Rollback manual)
            await Producto.deleteOne({ sku });
            throw new Error('Error en base de datos SQL (Verifique que exista el Almacén ID 1): ' + sqlError.message);
        }

        return { success: true, message: 'Producto creado correctamente' };
    }

    // --- NUEVO: ACTUALIZAR PRODUCTO ---
    async actualizarProducto(sku, datos, archivoImagen) {
        const { nombre, descripcion, precio, categoria } = datos;
        
        // 1. Preparar objeto para Mongo
        const updateData = {
            nombre,
            descripcion,
            precio_base: parseFloat(precio),
            categoria: datos.categoria
        };

        // Si subieron foto nueva, la actualizamos. Si no, dejamos la anterior.
        if (archivoImagen) {
            updateData.imagenes = [`/img/${archivoImagen.filename}`];
        }

        // 2. Actualizar MongoDB (Información visual)
        const actualizado = await Producto.findOneAndUpdate({ sku }, updateData, { new: true });
        if (!actualizado) throw new Error('Producto no encontrado en catálogo');

        // 3. Actualizar PostgreSQL (Costo referencial en inventario)
        // No actualizamos el stock aquí, eso se hace en el módulo "Ingresos" o "Ventas"
        try {
            await poolPg.query(
                'UPDATE inventario_resumen SET costo_promedio = $1 WHERE producto_sku = $2',
                [parseFloat(precio) * 0.8, sku] // Asumimos costo 80% del precio base
            );
        } catch (error) {
            console.error("Advertencia: No se pudo actualizar costo en Postgres", error.message);
            // No lanzamos error fatal para no bloquear la edición visual
        }

        return { success: true, message: 'Producto actualizado correctamente' };
    }

    async listarTodo() {
        // 1. Traemos el catálogo de MongoDB (Nombres, Fotos, Categoría)
        const productosMongo = await Producto.find().lean(); // .lean() para poder modificar el JSON

        try {
            // 2. Traemos el stock de PostgreSQL (La verdad de la milanesa)
            const stockQuery = 'SELECT producto_sku, stock_actual FROM inventario_resumen';
            const { rows: stockPg } = await poolPg.query(stockQuery);

            // 3. Convertimos el array de Postgres a un Objeto/Mapa para búsqueda rápida
            // { 'SKU-123': 50, 'SKU-456': 10 }
            const mapaStock = stockPg.reduce((acc, item) => {
                acc[item.producto_sku] = item.stock_actual;
                return acc;
            }, {});

            // 4. Fusionamos: Le pegamos el stock real a cada producto de Mongo
            const productosFusionados = productosMongo.map(p => ({
                ...p,
                // Si existe en Postgres, usa ese stock. Si no, 0.
                stock: mapaStock[p.sku] !== undefined ? mapaStock[p.sku] : 0
            }));

            return productosFusionados;

        } catch (error) {
            console.error("Error sincronizando stocks:", error);
            // Si falla Postgres, devolvemos la data de Mongo (mejor que nada)
            return productosMongo;
        }
    }
    
    // --- SOFT DELETE Y REACTIVACIÓN ---
    async eliminar(sku) {
        await Producto.updateOne({ sku }, { estado: 'INACTIVO' });
        return { message: 'Producto dado de baja (Inactivo)' };
    }

    async reactivar(sku) {
        await Producto.updateOne({ sku }, { estado: 'ACTIVO' });
        return { message: 'Producto reactivado exitosamente' };
    }
}
module.exports = new ProductoService();