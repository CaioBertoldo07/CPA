import express from 'express';
const router = express.Router();

import {
    createAvaliacao,
    editarAvaliacao,
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    verificarSeUsuarioRespondeu,
    enviarAvaliacao,
    prorrogarAvaliacao,
    deleteAvaliacao,
} from '../controllers/avaliacoesController';
import { authenticateToken } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Avaliações
 *   description: Gerenciamento do ciclo de avaliações (CPA)
 */

/**
 * @swagger
 * /api/avaliacoes:
 *   get:
 *     summary: Lista todas as avaliações cadastradas
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista com sucesso
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
 *                   ano:
 *                     type: integer
 *                   data_inicio:
 *                     type: string
 *                     format: date-time
 *                   data_fim:
 *                     type: string
 *                     format: date-time
 *   post:
 *     summary: Cria uma nova avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               ano:
 *                 type: integer
 *               data_inicio:
 *                 type: string
 *                 format: date-time
 *               data_fim:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 ano:
 *                   type: integer
 *                 data_inicio:
 *                   type: string
 *                   format: date-time
 *                 data_fim:
 *                   type: string
 *                   format: date-time
 */
router.post('/avaliacoes', createAvaliacao);
router.get('/avaliacoes', getAvaliacoes);

/**
 * @swagger
 * /api/avaliacoes/disponiveis:
 *   get:
 *     summary: Lista as avaliações ativas e disponíveis para respostas
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avaliações para o usuário
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
 *                   ano:
 *                     type: integer
 *                   data_inicio:
 *                     type: string
 *                     format: date-time
 *                   data_fim:
 *                     type: string
 *                     format: date-time
 */
router.get('/avaliacoes/disponiveis', authenticateToken, getAvaliacoesDisponiveis);

/**
 * @swagger
 * /api/avaliacoes/{id}:
 *   get:
 *     summary: Retorna os dados completos de uma avaliação (com eixos, dimensões, questões)
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Avaliação completa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 ano:
 *                   type: integer
 *                 data_inicio:
 *                   type: string
 *                   format: date-time
 *                 data_fim:
 *                   type: string
 *                   format: date-time
 *                 eixos:
 *                   type: array
 *                   items:
 *                     type: object
 *   delete:
 *     summary: Remove uma avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Removida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Avaliação removida
 */
router.get('/avaliacoes/:id', authenticateToken, getAvaliacaoById);
router.put('/avaliacoes/:id', authenticateToken, editarAvaliacao);
router.delete('/avaliacoes/:id', authenticateToken, deleteAvaliacao);

/**
 * @swagger
 * /api/verificar-resposta/{idAvaliacao}:
 *   get:
 *     summary: Verifica se o usuário atual já respondeu esta avaliação
 *     tags: [Avaliações]
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
 *         description: Flag indicando se respondeu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 respondeu:
 *                   type: boolean
 */
router.get('/verificar-resposta/:idAvaliacao', authenticateToken, verificarSeUsuarioRespondeu);

/**
 * @swagger
 * /api/avaliacoes/{id}/enviar:
 *   put:
 *     summary: Confirma o envio definitivo da avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Avaliação enviada com sucesso
 */
router.put('/avaliacoes/:id/enviar', authenticateToken, enviarAvaliacao);

/**
 * @swagger
 * /api/avaliacoes/{id}/prorrogar:
 *   put:
 *     summary: Prorroga a data limite de encerramento da avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               novaDataFim:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Prorrogado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Avaliação prorrogada com sucesso
 */
router.put('/avaliacoes/:id/prorrogar', authenticateToken, prorrogarAvaliacao);

export default router;
