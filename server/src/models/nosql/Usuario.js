const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Se guardará encriptada
    nombre_completo: String,
    email: String,
    rol: { 
        type: String, 
        enum: ['ADMIN', 'VENDEDOR', 'ALMACEN'], 
        default: 'VENDEDOR' 
    },
    // Perfil flexible (Requisito: Perfiles)
    perfil: {
        avatar: String,
        tema: { type: String, default: 'dark' },
        permisos: [String] // Ej: ['ver_reportes', 'anular_ventas']
    },
    estado: { type: String, default: 'ACTIVO', enum: ['ACTIVO', 'INACTIVO'] }
}, {
    timestamps: true,
    collection: 'usuarios_sistema'
});

module.exports = mongoose.model('Usuario', UsuarioSchema);