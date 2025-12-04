const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { verificarToken } = require('../middlewares/authMiddleware');


router.post('/consulta-api', clientesController.buscarPorDocumento);
router.get('/', clientesController.listar);
router.post('/', clientesController.crear);
router.use(verificarToken);
router.put('/:id', clientesController.actualizar); 
router.delete('/:id', clientesController.eliminar); 
router.patch('/:id/reactivar', clientesController.reactivar);

module.exports = router;