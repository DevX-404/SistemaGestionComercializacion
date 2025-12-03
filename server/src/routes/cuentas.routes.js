const express = require('express');
const router = express.Router();
const cuentasController = require('../controllers/cuentasController');

// Ruta: GET /api/cuentas
router.get('/', cuentasController.listarCuentas);
router.get('/:id/cronograma', cuentasController.verCronograma);
router.post('/pagar-cuota', cuentasController.pagarCuota);

module.exports = router;