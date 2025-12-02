const clienteService = require('../services/ClienteService');
const Joi = require('joi');

// Validación estricta
const schemaBusqueda = Joi.object({
    tipo: Joi.string().valid('DNI', 'RUC').required(),
    numero: Joi.string().pattern(/^[0-9]+$/).min(8).max(11).required()
        .messages({'string.pattern.base': 'El documento solo debe contener números'})
});

const buscarPorDocumento = async (req, res) => {
    try {
        const resultado = await clienteService.buscarOCrear(req.body);
        res.json({ success: true, ...resultado });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const lista = await clienteService.listarTodos();
        res.json(lista);
    } catch (error) {
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

module.exports = { buscarPorDocumento, listar, schemaBusqueda };