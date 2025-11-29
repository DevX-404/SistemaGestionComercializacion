const express = require('express');
const router = express.Router();
const { getUsuarios, crearUsuario, eliminarUsuario, editarUsuario } = require('../controllers/usuariosController');

router.get('/', getUsuarios);
router.post('/', crearUsuario);
router.put('/:id', editarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;