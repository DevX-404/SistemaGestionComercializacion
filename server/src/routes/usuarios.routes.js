const express = require('express');
const router = express.Router();
const { getUsuarios, crearUsuario, eliminarUsuario } = require('../controllers/usuariosController');

router.get('/', getUsuarios);
router.post('/', crearUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;