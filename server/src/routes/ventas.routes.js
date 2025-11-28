const express = require('express');
const router = express.Router();
const { procesarVenta } = require('../controllers/ventasController');

// POST http://localhost:3000/api/ventas/procesar
router.post('/procesar', procesarVenta);

module.exports = router;