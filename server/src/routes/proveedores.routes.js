const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// Rutas
router.get('/', proveedoresController.listar);
router.post('/', proveedoresController.crear);
router.delete('/:id', proveedoresController.eliminar);
router.post('/consulta-ruc', proveedoresController.consultarRuc);
router.patch('/:id/reactivar', proveedoresController.reactivar);

module.exports = router;