const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoriasController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', controller.listar);
router.use(verificarToken);
router.post('/', controller.crear);
router.delete('/:id', controller.eliminar);
router.patch('/:id/reactivar', controller.reactivar);

module.exports = router;