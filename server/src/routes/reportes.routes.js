const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Solo usuarios logueados pueden ver reportes
router.use(verificarToken);

// GET /api/reportes/ventas?inicio=2023-01-01&fin=2023-01-31
router.get('/ventas', reportesController.obtenerVentasPorFecha);
router.get('/general', reportesController.obtenerResumenGeneral);

module.exports = router;