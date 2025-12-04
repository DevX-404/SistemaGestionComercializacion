const express = require('express');
const router = express.Router();
const cuentasController = require('../controllers/cuentasController');

router.post('/consulta-publica', cuentasController.consultarPorDocumento);
router.post('/pagar-publico', cuentasController.pagarCuotaPublica);
// Ruta: GET /api/cuentas
router.get('/', cuentasController.listarCuentas);
router.get('/:id/cronograma', cuentasController.verCronograma);
router.post('/pagar-cuota', cuentasController.pagarCuota);
router.get('/:id', cuentasController.obtenerDetalle);

module.exports = router;