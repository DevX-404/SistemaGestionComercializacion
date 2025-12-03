const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// Rutas
router.get('/', proveedoresController.listar);
router.post('/', proveedoresController.crear);
router.delete('/:id', proveedoresController.eliminar);

// NUEVA RUTA PARA LA API SUNAT
router.post('/consulta-ruc', proveedoresController.consultarRuc);

module.exports = router;