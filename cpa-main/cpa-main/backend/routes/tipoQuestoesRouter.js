
const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const tipoQuestoesController = require('../controllers/tipoQuestoesController');

const router = express.Router();

router.get('/tipos', authenticateToken, tipoQuestoesController.getTipoQuestoes);


module.exports = router;


