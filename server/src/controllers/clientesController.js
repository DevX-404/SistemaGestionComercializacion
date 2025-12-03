const clienteService = require('../services/ClienteService');
const Joi = require('joi');

const schemaBusqueda = Joi.object({
    tipo: Joi.string().valid('DNI', 'RUC').required(),
    numero: Joi.string().pattern(/^[0-9]+$/).min(8).max(11).required()
        .messages({'string.pattern.base': 'El documento solo números'})
});

const buscarPorDocumento = async (req, res) => {
    try {
        const resultado = await clienteService.buscarOCrear(req.body);
        res.json({ success: true, ...resultado });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const lista = await clienteService.listarTodos();
        res.json(lista);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ESTA FUNCIÓN TE FALTABA ---
const crear = async (req, res) => {
    try {
        const resultado = await clienteService.crearCliente(req.body);
        res.status(201).json({ success: true, ...resultado });
    } catch (error) {
        // Si es error de negocio (ej: duplicado) mandamos 400
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { buscarPorDocumento, listar, crear, schemaBusqueda };