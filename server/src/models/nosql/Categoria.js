const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: String,
    estado: { type: Boolean, default: true } // true = ACTIVO, false = INACTIVO
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Categoria', CategoriaSchema);