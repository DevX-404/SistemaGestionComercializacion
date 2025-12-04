const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { verificarToken } = require('../middlewares/authMiddleware');


router.post('/consulta-api', clientesController.buscarPorDocumento);
router.use(verificarToken);
router.get('/', clientesController.listar);
router.post('/', clientesController.crear);
router.put('/:id', clientesController.actualizar); 
router.delete('/:id', clientesController.eliminar); 
router.patch('/:id/reactivar', clientesController.reactivar);

module.exports = router;