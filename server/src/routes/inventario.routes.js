const express = require('express');
const router = express.Router();
const { getProductosConStock } = require('../controllers/inventarioController');

// GET http://localhost:3000/api/inventario
router.get('/', getProductosConStock);

module.exports = router;