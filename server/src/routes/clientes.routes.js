const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const validarDatos = require('../middlewares/validarDatos');

// Ruta GET: http://localhost:3000/api/clientes
router.get('/', clientesController.listar);

// Ruta POST: http://localhost:3000/api/clientes/consultar
// Sirve para buscar o registrar automáticamente
router.post('/consultar', validarDatos(clientesController.schemaBusqueda), clientesController.buscarPorDocumento);

module.exports = router;