const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');
const validarDatos = require('../middlewares/validarDatos');

// GET: http://localhost:3000/api/proveedores
router.get('/', proveedoresController.listar);

// POST: http://localhost:3000/api/proveedores
router.post('/', validarDatos(proveedoresController.schemaProveedor), proveedoresController.crear);

module.exports = router;