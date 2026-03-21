import express from 'express';
const router = express.Router();
import * as eixosController from '../controllers/eixosController';
import {  authenticateToken, authorize  } from '../middleware/authMiddleware';


router.get('/eixos', authorize(['read:eixos']), eixosController.getEixos);
router.get('/eixos/:numeroEixo', authorize(['read:eixos']), eixosController.getEixoByNumero);
router.post('/eixos', authorize(['write:eixos']) , eixosController.postEixos);
router.put('/eixos/:numero', eixosController.updateEixos);  // Corrigido para incluir o parâmetro :id
router.delete('/eixos/:numero', eixosController.deleteEixos);

export default router;
