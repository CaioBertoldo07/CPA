import express from 'express';
const router = express.Router();
import * as eixosController from '../controllers/eixosController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';


/**
 * @swagger
 * tags:
 *   name: Eixos
 *   description: Gerenciamento dos Eixos do questionário
 */

/**
 * @swagger
 * /api/eixos:
 *   get:
 *     summary: Lista todos os eixos
 *     tags: [Eixos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eixos retornada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   numero:
 *                     type: integer
 *                   nome:
 *                     type: string
 *   post:
 *     summary: Cria um novo eixo
 *     tags: [Eixos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: integer
 *               nome:
 *                 type: string
 *     responses:
 *       201:
 *         description: Eixo criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numero:
 *                   type: integer
 *                 nome:
 *                   type: string
 */
router.get('/eixos', authorize(['admin']), eixosController.getEixos);
router.post('/eixos', authorize(['admin']), eixosController.postEixos);

/**
 * @swagger
 * /api/eixos/{numero}:
 *   get:
 *     summary: Retorna um eixo pelo número
 *     tags: [Eixos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do eixo
 *   put:
 *     summary: Atualiza um eixo
 *     tags: [Eixos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numero
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
 *               nome:
 *                 type: string
 *     responses:
 *       200:
 *         description: Eixo atualizado
 *   delete:
 *     summary: Remove um eixo
 *     tags: [Eixos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Eixo removido
 */
router.get('/eixos/:numeroEixo', authorize(['admin']), eixosController.getEixoByNumero);
router.put('/eixos/:numero', authorize(['admin']), eixosController.updateEixos);  // Corrigido para incluir o parâmetro :id
router.delete('/eixos/:numero', authorize(['admin']), eixosController.deleteEixos);

export default router;
