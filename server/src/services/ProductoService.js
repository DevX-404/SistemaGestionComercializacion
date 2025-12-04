const { poolPg } = require('../config/databases');
const Producto = require('../models/nosql/Producto');

class ProductoService {

    async crearProducto(datosProducto, archivoImagen) {
        console.log("📦 Creando producto:", datosProducto); // Log para depurar

        // 1. LIMPIEZA DE DATOS (Parsing robusto)
        const sku = (datosProducto.sku || '').toUpperCase();
        // Convertir a número, si falla usa 0
        const precio = parseFloat(datosProducto.precio) || 0;
        const stock_inicial = parseInt(datosProducto.stock_inicial) || 0;
        const stock_minimo = parseInt(datosProducto.stock_minimo) || 5;
        
        const categoria = datosProducto.categoria;
        const nombre = datosProducto.nombre;
        const descripcion = datosProducto.descripcion;

        // Validación Básica
        if (!sku) throw new Error("El SKU es obligatorio");
        if (!nombre) throw new Error("El Nombre es obligatorio");
        if (!categoria || categoria === 'undefined') throw new Error("Categoría inválida");

        const rutaImagen = archivoImagen ? `/img/${archivoImagen.filename}` : null;

        // 2. Validar Duplicados (Mongo)
        const existeMongo = await Producto.findOne({ sku });
        if (existeMongo) throw new Error(`El SKU ${sku} ya existe en el Catálogo.`);

        // 3. GUARDAR EN MONGO
        const nuevoProductoMongo = new Producto({
            sku, nombre, descripcion, precio_base: precio,
            imagenes: rutaImagen ? [rutaImagen] : [],
            categoria,
            specs: { stock_minimo: stock_minimo.toString() }, // Guardamos ref en specs
            estado: 'ACTIVO'
        });
        await nuevoProductoMongo.save();

        // 4. GUARDAR EN POSTGRESQL
        try {
            // Verificamos si existe el almacén 1, si no, lo creamos al vuelo para evitar error
            await poolPg.query("INSERT INTO almacenes (id, nombre, ubicacion) VALUES (1, 'Principal', 'Local') ON CONFLICT (id) DO NOTHING");

            await poolPg.query(
                'INSERT INTO inventario_resumen (producto_sku, almacen_id, stock_actual, stock_minimo, costo_promedio) VALUES ($1, 1, $2, $3, $4)',
                [sku, stock_inicial, stock_minimo, precio * 0.8]
            );
        } catch (sqlError) {
            console.error("❌ Error SQL:", sqlError);
            // Rollback manual: Borramos de Mongo si falló SQL
            await Producto.deleteOne({ sku });
            throw new Error('Error guardando en Inventario: ' + sqlError.message);
        }

        return { success: true, message: 'Producto creado correctamente' };
    }

    async actualizarProducto(sku, datos, archivoImagen) {
        console.log("✏️ Editando:", sku, datos);
        
        const precio = parseFloat(datos.precio) || 0;
        const stock_minimo = parseInt(datos.stock_minimo); // Puede ser NaN si no se envía

        // 1. Update Mongo
        const updateData = {
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio_base: precio,
            categoria: datos.categoria
        };

        if (archivoImagen) updateData.imagenes = [`/img/${archivoImagen.filename}`];

        const actualizado = await Producto.findOneAndUpdate({ sku }, updateData, { new: true });
        if (!actualizado) throw new Error('Producto no encontrado');

        // 2. Update Postgres (Solo si se envió stock_minimo válido)
        try {
            if (!isNaN(stock_minimo)) {
                await poolPg.query(
                    'UPDATE inventario_resumen SET stock_minimo = $1, costo_promedio = $2 WHERE producto_sku = $3',
                    [stock_minimo, precio * 0.8, sku]
                );
            } else {
                await poolPg.query(
                    'UPDATE inventario_resumen SET costo_promedio = $1 WHERE producto_sku = $2',
                    [precio * 0.8, sku]
                );
            }
        } catch (e) { console.error("Advertencia SQL:", e.message); }

        return { success: true, message: 'Producto actualizado' };
    }

    // ... (Mantén listarTodo, eliminar y reactivar igual que antes)
    async listarTodo() {
        const productosMongo = await Producto.find().lean();
        try {
            const { rows: stockPg } = await poolPg.query('SELECT producto_sku, stock_actual, stock_minimo FROM inventario_resumen');
            const mapa = stockPg.reduce((acc, item) => { acc[item.producto_sku] = item; return acc; }, {});
            return productosMongo.map(p => ({
                ...p,
                stock: mapa[p.sku]?.stock_actual || 0,
                stock_minimo: mapa[p.sku]?.stock_minimo || 5
            }));
        } catch (error) { return productosMongo; }
    }
    
    async eliminar(sku) { await Producto.updateOne({ sku }, { estado: 'INACTIVO' }); return { message: 'Baja exitosa' }; }
    async reactivar(sku) { await Producto.updateOne({ sku }, { estado: 'ACTIVO' }); return { message: 'Reactivado' }; }
}

module.exports = new ProductoService();