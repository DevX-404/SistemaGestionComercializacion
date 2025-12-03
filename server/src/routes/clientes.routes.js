const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Proteger rutas críticas
router.use(verificarToken);

router.post('/consulta-api', clientesController.buscarPorDocumento);
router.get('/', clientesController.listar);
router.post('/', clientesController.crear);
router.put('/:id', clientesController.actualizar); 
router.delete('/:id', clientesController.eliminar); 

module.exports = router;