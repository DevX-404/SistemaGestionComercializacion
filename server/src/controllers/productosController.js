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
        // req.body tiene los campos de texto
        // req.file tiene la imagen
        const resultado = await productoService.crearProducto(req.body, req.file);
        res.status(201).json(resultado);
    } catch (error) {
        console.error("🔥 Error creando producto:", error); 
        res.status(400).json({ 
            error: true, 
            message: error.message || 'Error al procesar la solicitud' 
        });
    }
};

// NUEVO: ACTUALIZAR
const actualizar = async (req, res) => {
    try {
        const resultado = await productoService.actualizarProducto(req.params.sku, req.body, req.file);
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
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
        const resultado = await productoService.eliminar(req.params.sku);
        res.json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// Nuevo método para reactivar
const reactivar = async (req, res) => {
    try {
        const resultado = await productoService.reactivar(req.params.sku);
        res.json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { crear, listar, eliminar, reactivar, actualizar };