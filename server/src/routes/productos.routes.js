const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const validarDatos = require('../middlewares/validarDatos'); // El guardia

// Ruta para listar (GET)
router.get('/', productosController.listar);

// Ruta para crear (POST) - ¡Fíjate cómo inyectamos el validador en medio!
router.post('/', validarDatos(productosController.schemaProducto), productosController.crear);

module.exports = router;