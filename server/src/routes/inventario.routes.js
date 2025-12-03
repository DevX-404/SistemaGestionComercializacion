const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// POST /api/inventario/entrada
router.post('/entrada', inventarioController.agregarStock);

module.exports = router;