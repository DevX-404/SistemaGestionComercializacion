const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const multer = require('multer');
const path = require('path');

// --- Configuración de Multer (Subida de imágenes) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img'); // Carpeta donde se guardan
    },
    filename: (req, file, cb) => {
        // Nombre único: imagen-FECHA-RANDOM.jpg
        const unico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + unico + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Rutas ---
router.get('/', productosController.listar);
router.post('/', upload.single('imagen'), productosController.crear); // <--- OJO AQUÍ
router.delete('/:sku', productosController.eliminar);

module.exports = router;