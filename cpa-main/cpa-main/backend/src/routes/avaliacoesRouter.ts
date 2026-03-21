import express from 'express';
const router = express.Router();

import { 
    createAvaliacao,
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    verificarSeUsuarioRespondeu,
    enviarAvaliacao,       // ADICIONADO
    prorrogarAvaliacao,    // ADICIONADO
    deleteAvaliacao,    // ADICIONADO
 } from '../controllers/avaliacoesController';
import {  authenticateToken  } from '../middleware/authMiddleware';

router.post('/avaliacoes', createAvaliacao);
router.get('/avaliacoes', getAvaliacoes);
router.get('/avaliacoes/disponiveis', authenticateToken, getAvaliacoesDisponiveis);
router.get('/avaliacoes/:id', authenticateToken, getAvaliacaoById);
router.get('/verificar-resposta/:idAvaliacao', authenticateToken, verificarSeUsuarioRespondeu);
router.put('/avaliacoes/:id/enviar', authenticateToken, enviarAvaliacao);           // ADICIONADO
router.put('/avaliacoes/:id/prorrogar', authenticateToken, prorrogarAvaliacao);
router.delete('/avaliacoes/:id', authenticateToken, deleteAvaliacao); // ADICIONADO (estava comentada antes)

export default router;
