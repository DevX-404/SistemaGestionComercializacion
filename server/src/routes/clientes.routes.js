const express = require('express');
const router = express.Router();
const { getClientes, consultarExterno, crearCliente } = require('../controllers/clientesController');

router.get('/', getClientes);           // Listar todos
router.post('/consulta-api', consultarExterno); // Consultar a RENIEC/SUNAT
router.post('/', crearCliente);         // Guardar en BD

module.exports = router;