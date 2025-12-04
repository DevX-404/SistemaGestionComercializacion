const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true }, // El enlace con SQL
    nombre: { type: String, required: true },
    descripcion: String, // Unificamos descripcion_corta y html en uno solo para simpleza
    precio_base: { type: Number, required: true },
    imagenes: [String],
    categoria: { type: String, required: true, default: 'General' },
    specs: { type: Map, of: String }, // JSON flexible
    estado: { type: String, default: 'ACTIVO', enum: ['ACTIVO', 'INACTIVO'] }
}, {
    timestamps: true,
    collection: 'productos_catalogo' // Nombre exacto de tu colección en Mongo
});

module.exports = mongoose.model('Producto', ProductoSchema);