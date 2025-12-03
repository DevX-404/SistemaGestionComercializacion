const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

// Middleware de validación (Opcional si usas Joi en el controller)
const validarBusqueda = (req, res, next) => {
    const { error } = clientesController.schemaBusqueda.validate(req.body);
    if (error) return res.status(400).json({ success: false, mensaje: error.details[0].message });
    next();
};

// Ruta 1: Buscar datos (API Externa o BD)
router.post('/consulta-api', validarBusqueda, clientesController.buscarPorDocumento);

// Ruta 2: Listar clientes (Para la tabla)
router.get('/', clientesController.listar);

// Ruta 3: Guardar nuevo cliente
router.post('/', clientesController.crear); // Asegúrate de agregar 'crear' en tu controller abajo

module.exports = router;