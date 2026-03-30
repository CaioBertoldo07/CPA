import express from 'express';
const router = express.Router();
import * as padraoRespostaController from '../controllers/padraoRespostaController';
import { authorize } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Padrão Resposta
 *   description: Gerenciamento de Padrões de Respostas
 */

/**
 * @swagger
 * /api/padraoresposta:
 *   get:
 *     summary: Lista todos os padrões de resposta
 *     tags: [Padrão Resposta]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   descricao:
 *                     type: string
 *   post:
 *     summary: Cria um padrão de resposta
 *     tags: [Padrão Resposta]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 descricao:
 *                   type: string
 */
router.get('/padraoresposta', padraoRespostaController.getPadraoResposta);
router.post('/padraoresposta', authorize(['admin']), padraoRespostaController.postPadraoResposta);

/**
 * @swagger
 * /api/padraoresposta/{id}:
 *   get:
 *     summary: Retorna um padrão de resposta
 *     tags: [Padrão Resposta]
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
 *         description: Dados do padrão
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 descricao:
 *                   type: string
 *   put:
 *     summary: Atualiza um padrão
 *     tags: [Padrão Resposta]
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
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 descricao:
 *                   type: string
 *   delete:
 *     summary: Deleta um padrão
 *     tags: [Padrão Resposta]
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
 *         description: Deletado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Padrão deletado
 */
router.get('/padraoresposta/:id', padraoRespostaController.getPadraoRespostaById);
router.put('/padraoresposta/:id', authorize(['admin']), padraoRespostaController.putPadraoResposta);
router.delete('/padraoresposta/:id', authorize(['admin']), padraoRespostaController.deletePadraoResposta);



export default router;