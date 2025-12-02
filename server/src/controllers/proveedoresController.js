const proveedorService = require('../services/ProveedorService');
const Joi = require('joi');

// Validación estricta para empresas peruanas
const schemaProveedor = Joi.object({
    ruc: Joi.string().length(11).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'El RUC debe tener exactamente 11 dígitos',
        'string.pattern.base': 'El RUC solo debe contener números'
    }),
    razon_social: Joi.string().min(3).required(),
    contacto_nombre: Joi.string().optional().allow(''),
    telefono: Joi.string().min(6).optional().allow(''),
    direccion: Joi.string().optional().allow('')
});

const listar = async (req, res) => {
    try {
        const proveedores = await proveedorService.listarTodos();
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const resultado = await proveedorService.crear(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        // Si es error de negocio (ya existe), mandamos 400, si es base de datos 500
        const codigo = error.message.includes('ya está registrado') ? 400 : 500;
        res.status(codigo).json({ success: false, mensaje: error.message });
    }
};

module.exports = { listar, crear, schemaProveedor };