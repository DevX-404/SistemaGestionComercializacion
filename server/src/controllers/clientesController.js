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

const actualizar = async (req, res) => {
    try {
        const resultado = await clienteService.actualizarCliente(req.params.id, req.body);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const resultado = await clienteService.eliminarCliente(req.params.id);
        res.json(resultado);
    } catch (error) {
        // Si es error de negocio (tiene ventas), mandamos 409 Conflict
        const status = error.message.includes('CRÍTICO') ? 409 : 500;
        res.status(status).json({ message: error.message });
    }
};

const reactivar = async (req, res) => {
    const { connectMySQL } = require('../config/databases'); // Asegúrate de importar
    const connection = await connectMySQL();
    try {
        await connection.execute("UPDATE clientes SET estado = 'ACTIVO' WHERE id = ?", [req.params.id]);
        res.json({ message: 'Cliente reactivado exitosamente' });
    } catch (e) { 
        res.status(500).json({ error: e.message });
    } finally {
        if (connection) connection.end();
    }
};

module.exports = { buscarPorDocumento, listar, crear, schemaBusqueda, actualizar, eliminar, reactivar };