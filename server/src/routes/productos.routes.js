const express = require('express');
const router = express.Router();
const { upload, getProductos, crearProducto, eliminarProducto } = require('../controllers/productosController');

router.get('/', getProductos);
// 'imagen' es el nombre del campo del formulario que traerá el archivo
router.post('/', upload.single('imagen'), crearProducto);
router.delete('/:sku', eliminarProducto);

module.exports = router;