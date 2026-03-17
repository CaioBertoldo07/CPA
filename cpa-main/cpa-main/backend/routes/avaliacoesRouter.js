const express = require('express');
const router = express.Router();
const { createAvaliacao, getAvaliacoes, getAvaliacoesDisponiveis, getAvaliacaoById, verificarSeUsuarioRespondeu} = require('../controllers/avaliacoesController');
const { authenticateToken} = require('../middleware/authMiddleware');

// Rota para criar uma nova avaliação
router.post('/avaliacoes', createAvaliacao);

// Rota para obter todas as avaliações
router.get('/avaliacoes', getAvaliacoes);

// Rota para verificar avaliações disponíveis para um curso
router.get('/avaliacoes/disponiveis',authenticateToken, getAvaliacoesDisponiveis);


router.get('/avaliacoes/:id', authenticateToken, getAvaliacaoById); 

// router.delete('/avaliacoes/:id', authenticateToken, deleteAvaliacao);

router.get('/verificar-resposta/:idAvaliacao', authenticateToken, verificarSeUsuarioRespondeu);




module.exports = router;
