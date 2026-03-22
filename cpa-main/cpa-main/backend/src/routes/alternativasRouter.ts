import express from 'express';
const router = express.Router();
import * as alternativasController from '../controllers/alternativasController';

/**
 * @swagger
 * tags:
 *   name: Alternativas
 *   description: Gerenciamento das opções das questões
 */

/**
 * @swagger
 * /api/alternativas:
 *   get:
 *     summary: Retorna todas as alternativas
 *     tags: [Alternativas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alternativas retornada com sucesso
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
 *                   valor:
 *                     type: integer
 *                   idPadraoResposta:
 *                     type: integer
 *   post:
 *     summary: Cria uma alternativa
 *     tags: [Alternativas]
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
 *               valor:
 *                 type: integer
 *               idPadraoResposta:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Alternativa criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 descricao:
 *                   type: string
 *                 valor:
 *                   type: integer
 *                 idPadraoResposta:
 *                   type: integer
 */
router.get('/alternativas', alternativasController.getAlternativas);
router.post('/alternativas', alternativasController.postAlternativas);

/**
 * @swagger
 * /api/alternativas/{id}:
 *   get:
 *     summary: Retorna uma alternativa específica
 *     tags: [Alternativas]
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
 *         description: Dados da alternativa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 descricao:
 *                   type: string
 *                 valor:
 *                   type: integer
 *                 idPadraoResposta:
 *                   type: integer
 *   put:
 *     summary: Atualiza uma alternativa
 *     tags: [Alternativas]
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
 *               valor:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Alternativa atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 descricao:
 *                   type: string
 *                 valor:
 *                   type: integer
 *                 idPadraoResposta:
 *                   type: integer
 *   delete:
 *     summary: Deleta uma alternativa
 *     tags: [Alternativas]
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
 *         description: Alternativa deletada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Alternativa deletada
 */
router.get('/alternativas/:id', alternativasController.getAlternativaById);
router.put('/alternativas/:id', alternativasController.putAlternativas);
router.delete('/alternativas/:id', alternativasController.deleteAlternativas);

/**
 * @swagger
 * /api/alternativas/byIdPadrao/{id}:
 *   get:
 *     summary: Retorna alternativas pelo ID do Padrão de Resposta
 *     tags: [Alternativas]
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
 *         description: Lista de alternativas
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
 *                   valor:
 *                     type: integer
 *                   idPadraoResposta:
 *                     type: integer
 */
router.get('/alternativas/byIdPadrao/:id', alternativasController.getAlternativasByPadraoRespostaId);


export default router;