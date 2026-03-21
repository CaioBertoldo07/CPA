import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as respostasController from '../controllers/respostasController';

const router = express.Router();

router.post('/respostas', authenticateToken, respostasController.salvarRespostas);
router.get('/avaliacoes/:idAvaliacao/respostas', authenticateToken, respostasController.getRespostasByAvaliacao);


export default router;


