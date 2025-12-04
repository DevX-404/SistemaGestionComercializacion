const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true }, 
    nombre: { type: String, required: true },
    descripcion: String, 
    precio_base: { type: Number, required: true },
    imagenes: [String],
    categoria: { type: String, required: true, default: 'General' },
    specs: { type: Map, of: String },
    estado: { type: String, default: 'ACTIVO', enum: ['ACTIVO', 'INACTIVO'] }
}, {
    timestamps: true,
    collection: 'productos_catalogo' 
});

module.exports = mongoose.model('Producto', ProductoSchema);