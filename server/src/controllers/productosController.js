const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ProductoMongo = require('../models/nosql/Producto');
const { poolPg } = require('../config/databases');

// --- 1. CONFIGURACIÓN DE MULTER (SUBIDA DE IMÁGENES) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/img');
        // Crear carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Nombre único: sku-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// --- 2. LOGICA DE NEGOCIO ---

// Listar Productos (Con buscador simple)
const getProductos = async (req, res) => {
    try {
        const { search } = req.query;
        let filtro = { estado: 'activo' };

        // Filtro de búsqueda en MongoDB (Regex)
        if (search) {
            filtro = {
                ...filtro,
                $or: [
                    { nombre: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const productos = await ProductoMongo.find(filtro).sort({ createdAt: -1 });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear Producto (La operación Monstruosa)
const crearProducto = async (req, res) => {
    try {
        const { sku, nombre, descripcion, precio, stock_inicial, categoria } = req.body;
        
        // Validar si subieron imagen
        const imagenUrl = req.file ? `/img/${req.file.filename}` : '/img/placeholder.png';

        // 1. VALIDACIÓN: ¿Existe el SKU?
        const existeMongo = await ProductoMongo.findOne({ sku });
        if (existeMongo) return res.status(400).json({ message: 'El SKU ya existe en el catálogo' });

        // 2. GUARDAR EN MONGODB (Catálogo Visual)
        const nuevoProducto = new ProductoMongo({
            sku,
            nombre,
            descripcion_corta: descripcion,
            precio_base: parseFloat(precio),
            imagenes: [imagenUrl],
            specs: { categoria } // Ejemplo de campo flexible
        });
        await nuevoProducto.save();

        // 3. GUARDAR EN POSTGRESQL (Stock Lógico)
        // Insertamos en inventario_resumen
        await poolPg.query(
            `INSERT INTO inventario_resumen (producto_sku, almacen_id, stock_actual, stock_minimo) 
             VALUES ($1, 1, $2, 5)`,
            [sku, parseInt(stock_inicial) || 0]
        );

        // 4. REGISTRAR EN KARDEX (Auditoría de Ingreso)
        if (parseInt(stock_inicial) > 0) {
            await poolPg.query(
                `INSERT INTO kardex_movimientos 
                (producto_sku, almacen_id, tipo_movimiento, cantidad, saldo_stock_resultante, referencia_documento)
                VALUES ($1, 1, 'INVENTARIO_INICIAL', $2, $2, 'CREACION_PRODUCTO')`,
                [sku, parseInt(stock_inicial)]
            );
        }

        res.status(201).json({ message: 'Producto creado en Mongo y Postgres', producto: nuevoProducto });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Eliminar Producto (Lógico)
const eliminarProducto = async (req, res) => {
    try {
        const { sku } = req.params;
        // En un sistema real, haríamos "Soft Delete" (cambiar estado a inactivo)
        await ProductoMongo.findOneAndUpdate({ sku }, { estado: 'inactivo' });
        res.json({ message: 'Producto desactivado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    upload, 
    getProductos, 
    crearProducto, 
    eliminarProducto 
};