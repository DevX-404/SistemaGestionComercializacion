const express = require('express');
const router = express.Router();
const { getReportes } = require('../controllers/reportesController');

router.get('/dashboard', getReportes);

module.exports = router;