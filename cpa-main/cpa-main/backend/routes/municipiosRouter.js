const express = require('express');
const router = express.Router();
const municipiosController = require('../controllers/municipiosController');

router.get('/municipios', municipiosController.getMunicipios);
router.get('/municipios/:id', municipiosController.getMunicipioById);

module.exports = router;
