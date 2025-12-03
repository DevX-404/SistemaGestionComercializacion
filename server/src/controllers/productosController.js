const productoService = require('../services/ProductoService');
const Joi = require('joi');

// Validación
const schemaProducto = Joi.object({
    sku: Joi.string().required(),
    nombre: Joi.string().required(),
    precio: Joi.number().required(),
    stock_inicial: Joi.number().default(0),
    descripcion: Joi.string().allow('').optional(),
    categoria: Joi.string().required()
});

const crear = async (req, res) => {
    try {
        // 1. Validar texto
        const { error } = schemaProducto.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        // 2. Pasar datos + archivo al servicio
        // req.file viene gracias a Multer (que configuraremos en la ruta)
        const resultado = await productoService.crearProducto(req.body, req.file);
        
        res.status(201).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const lista = await productoService.listarTodo();
        res.json(lista);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        await productoService.eliminar(req.params.sku);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { crear, listar, eliminar };