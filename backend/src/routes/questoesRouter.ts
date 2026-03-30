import express from 'express';
const router = express.Router();
import * as questoesController from '../controllers/questoesController';
import { authorize } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Questões
 *   description: Gerenciamento do banco de questões
 */

/**
 * @swagger
 * /api/questoes:
 *   get:
 *     summary: Lista todas as questões
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de questões
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   enunciado:
 *                     type: string
 *                   idCategoria:
 *                     type: integer
 *                   numeroDimensao:
 *                     type: integer
 *                   idPadraoResposta:
 *                     type: integer
 *                   idTipoQuestao:
 *                     type: integer
 *   post:
 *     summary: Cria uma nova questão
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enunciado:
 *                 type: string
 *               idCategoria:
 *                 type: integer
 *               numeroDimensao:
 *                 type: integer
 *               idPadraoResposta:
 *                 type: integer
 *               idTipoQuestao:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Questão criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 enunciado:
 *                   type: string
 *                 idCategoria:
 *                   type: integer
 *                 numeroDimensao:
 *                   type: integer
 *                 idPadraoResposta:
 *                   type: integer
 *                 idTipoQuestao:
 *                   type: integer
 */
router.get('/questoes', questoesController.getQuestoes);
router.post('/questoes', authorize(['admin']), questoesController.postQuestoes)

/**
 * @swagger
 * /api/questoes/{id}:
 *   get:
 *     summary: Retorna uma questão pelo ID
 *     tags: [Questões]
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
 *         description: Dados da questão
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 enunciado:
 *                   type: string
 *                 idCategoria:
 *                   type: integer
 *                 numeroDimensao:
 *                   type: integer
 *                 idPadraoResposta:
 *                   type: integer
 *                 idTipoQuestao:
 *                   type: integer
 *   put:
 *     summary: Atualiza uma questão
 *     tags: [Questões]
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
 *               enunciado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 enunciado:
 *                   type: string
 *                 idCategoria:
 *                   type: integer
 *                 numeroDimensao:
 *                   type: integer
 *                 idPadraoResposta:
 *                   type: integer
 *                 idTipoQuestao:
 *                   type: integer
 *   delete:
 *     summary: Deleta uma questão
 *     tags: [Questões]
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
 *                   example: Questão deletada
 */
router.get('/questoes/:id', questoesController.getQuestaoById)
router.put('/questoes/:id', authorize(['admin']), questoesController.updateQuestoes)
router.delete('/questoes/:id', authorize(['admin']), questoesController.deleteQuestoes)


export default router;