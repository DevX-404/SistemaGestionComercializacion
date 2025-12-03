const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// CORRECCIÓN: Cambiamos '/nueva' por '/' para que coincida con el frontend
// Ruta POST: http://localhost:3000/api/ventas
router.post('/', ventasController.procesarVenta);

module.exports = router;