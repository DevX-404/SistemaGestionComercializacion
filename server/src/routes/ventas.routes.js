const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// Ruta POST: http://localhost:3000/api/ventas/nueva
router.post('/nueva', ventasController.procesarVenta);

module.exports = router;