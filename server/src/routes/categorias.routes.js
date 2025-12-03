const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoriasController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', controller.listar);
router.post('/', controller.crear);
router.delete('/:id', controller.eliminar);

module.exports = router;