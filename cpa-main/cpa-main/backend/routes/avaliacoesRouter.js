const express = require('express');
const router = express.Router();

const {
    createAvaliacao,
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    verificarSeUsuarioRespondeu,
    enviarAvaliacao,       // ADICIONADO
    prorrogarAvaliacao,    // ADICIONADO
    deleteAvaliacao,    // ADICIONADO
} = require('../controllers/avaliacoesController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/avaliacoes', createAvaliacao);
router.get('/avaliacoes', getAvaliacoes);
router.get('/avaliacoes/disponiveis', authenticateToken, getAvaliacoesDisponiveis);
router.get('/avaliacoes/:id', authenticateToken, getAvaliacaoById);
router.get('/verificar-resposta/:idAvaliacao', authenticateToken, verificarSeUsuarioRespondeu);
router.put('/avaliacoes/:id/enviar', authenticateToken, enviarAvaliacao);           // ADICIONADO
router.put('/avaliacoes/:id/prorrogar', authenticateToken, prorrogarAvaliacao);
router.delete('/avaliacoes/:id', authenticateToken, deleteAvaliacao); // ADICIONADO (estava comentada antes)

module.exports = router;
