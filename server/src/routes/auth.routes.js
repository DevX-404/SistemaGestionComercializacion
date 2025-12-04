const express = require('express');
const router = express.Router();
const { login, registrarAdminInicial } = require('../controllers/authController');

router.post('/login', login);
router.get('/init', registrarAdminInicial); 

module.exports = router;