const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true }, // El enlace con SQL
    nombre: { type: String, required: true },
    descripcion_corta: String,
    precio_base: Number,
    imagenes: [String], // Array de URLs
    specs: Object, // JSON flexible
    estado: { type: String, default: 'ACTIVO', enum: ['ACTIVO', 'INACTIVO'] }
}, {
    timestamps: true,
    collection: 'productos_catalogo' // Nombre exacto de tu colección en Mongo
});

module.exports = mongoose.model('Producto', ProductoSchema);