import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as respostasController from '../controllers/respostasController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Respostas
 *   description: Submissão e consulta de respostas dos formulários
 */

/**
 * @swagger
 * /api/respostas:
 *   post:
 *     summary: Salva as respostas de uma avaliação
 *     tags: [Respostas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idAvaliacao:
 *                 type: integer
 *               respostas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idQuestao:
 *                       type: integer
 *                     idAlternativa:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Respostas salvas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Respostas salvas com sucesso
 */
router.post('/respostas', authenticateToken, respostasController.salvarRespostas);

/**
 * @swagger
 * /api/avaliacoes/{idAvaliacao}/respostas:
 *   get:
 *     summary: Consulta as respostas agrupadas de uma avaliação (para administradores)
 *     tags: [Respostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAvaliacao
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de respostas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idAvaliacao:
 *                     type: integer
 *                   respostas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         idQuestao:
 *                           type: integer
 *                         idAlternativa:
 *                           type: integer
 */
router.get('/avaliacoes/:idAvaliacao/respostas', authenticateToken, respostasController.getRespostasByAvaliacao);
router.get('/avaliacoes/:id/relatorio/disciplinas', authenticateToken, respostasController.getRelatorioDisciplinas);

/**
 * @swagger
 * /api/dashboard/estatisticas-categorias:
 *   get:
 *     summary: Retorna estatísticas de respondentes por categoria para o dashboard global
 *     tags: [Respostas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas por categoria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categorias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoria:
 *                         type: string
 *                       respondentes:
 *                         type: integer
 *                       populacao:
 *                         type: integer
 *                       participacao:
 *                         type: number
 */
router.get('/dashboard/estatisticas-categorias', authenticateToken, respostasController.getDashboardCategorias);

export default router;


