const productoService = require('../services/ProductoService');
const Joi = require('joi');

// Definimos las reglas de validación (Aquí aseguras que no te manden basura)
const schemaProducto = Joi.object({
    sku: Joi.string().min(3).required().messages({'any.required': 'El SKU es obligatorio'}),
    nombre: Joi.string().required(),
    precio: Joi.number().min(0).required(),
    stock_inicial: Joi.number().integer().min(0).default(0),
    descripcion: Joi.string().optional(),
    categoria: Joi.string().required()
});

// Controlador para CREAR
const crear = async (req, res) => {
    try {
        const resultado = await productoService.crearProducto(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Controlador para LISTAR
const listar = async (req, res) => {
    try {
        const lista = await productoService.listarTodo();
        res.json(lista);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { crear, listar, schemaProducto };