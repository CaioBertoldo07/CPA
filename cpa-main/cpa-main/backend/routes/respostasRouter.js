const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const respostasController = require('../controllers/respostasController');

const router = express.Router();

router.post('/respostas', authenticateToken, respostasController.salvarRespostas);
router.get('/avaliacoes/:id_avaliacao/respostas', authenticateToken, respostasController.getRespostasPorAvaliacao);


module.exports = router;


