
import express from 'express';
import {  authenticateToken  } from '../middleware/authMiddleware';
import * as tipoQuestoesController from '../controllers/tipoQuestoesController';

const router = express.Router();

router.get('/tipos', authenticateToken, tipoQuestoesController.getTipoQuestoes);


export default router;


