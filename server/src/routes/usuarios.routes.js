const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', usuariosController.listar);
router.post('/', usuariosController.crear);
router.put('/:id', usuariosController.editar);
router.delete('/:id', usuariosController.eliminar);

module.exports = router;