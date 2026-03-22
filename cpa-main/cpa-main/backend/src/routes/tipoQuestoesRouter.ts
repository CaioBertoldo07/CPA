
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as tipoQuestoesController from '../controllers/tipoQuestoesController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tipos de Questão
 *   description: Consulta dos tipos de questões disponíveis
 */

/**
 * @swagger
 * /api/tipos:
 *   get:
 *     summary: Lista todos os tipos de questões (Múltipla Escolha, etc)
 *     tags: [Tipos de Questão]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 */
router.get('/tipos', authenticateToken, tipoQuestoesController.getTipoQuestoes);

export default router;


