const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/resumen', dashboardController.obtenerKPIs);
router.get('/ventas-semana', dashboardController.obtenerVentasSemana); 

module.exports = router;