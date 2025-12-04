const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// Ruta POST: http://localhost:3000/api/ventas
router.post('/', ventasController.procesarVenta);
router.get('/:id', ventasController.obtenerDetalleVenta);

module.exports = router;