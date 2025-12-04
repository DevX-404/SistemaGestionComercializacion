const proveedorService = require('../services/ProveedorService');
const { poolPg } = require('../config/databases');
const Joi = require('joi');

// Schema de validación 
const schemaProveedor = Joi.object({
    ruc: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
    razon_social: Joi.string().required(),
    contacto_nombre: Joi.string().allow('').optional(),
    telefono: Joi.string().allow('').optional(),
    direccion: Joi.string().allow('').optional()
});

const listar = async (req, res) => {
    try {
        const lista = await proveedorService.listarTodos();
        res.json(lista);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const crear = async (req, res) => {
    try {
        // Validamos datos
        const { error } = schemaProveedor.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const result = await proveedorService.crear(req.body);
        res.status(201).json(result);
    } catch (e) { res.status(400).json({ message: e.message }); }
};

// SOFT DELETE 
const eliminar = async (req, res) => {
    try {
        await poolPg.query("UPDATE proveedores SET estado = 'INACTIVO' WHERE id = $1", [req.params.id]);
        res.json({ message: 'Proveedor pasado a inactivo' });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: e.message }); 
    }
};

// --- CONSULTAR RUC ---
const consultarRuc = async (req, res) => {
    try {
        const { ruc } = req.body;
        if (!ruc || ruc.length !== 11) return res.status(400).json({ message: 'RUC inválido' });

        const datos = await proveedorService.buscarRUC(ruc);
        res.json({ success: true, ...datos });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const reactivar = async (req, res) => {
    try {
        await poolPg.query("UPDATE proveedores SET estado = 'ACTIVO' WHERE id = $1", [req.params.id]);
        res.json({ message: 'Proveedor reactivado' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { listar, crear, eliminar, consultarRuc, reactivar };