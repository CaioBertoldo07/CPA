// /src/routes/dimensoesRoutes.js
import express from 'express';
const router = express.Router();
import * as dimensoesController from '../controllers/dimensoesController';
import { authorize } from '../middleware/authMiddleware';

// Rota para obter uma dimensão pelo número
router.get('/numero/:numero', dimensoesController.getDimensaoByNumero);

// Rota para obter dimensões por número do eixo
router.get('/eixo/:numeroEixo', dimensoesController.getDimensoesByEixo);

// Rota para obter o número do eixo associado a uma dimensão
router.get('/eixo/numero/:numeroDimensao', dimensoesController.getNumeroEixoByDimensao);


/**
 * @swagger
 * tags:
 *   name: Dimensões
 *   description: Gerenciamento das Dimensões do questionário
 */

/**
 * @swagger
 * /api/dimensoes:
 *   get:
 *     summary: Retorna a lista de todas as dimensões
 *     tags: [Dimensões]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dimensões retornada com sucesso
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
 *                   numero_eixos:
 *                     type: integer
 *   post:
 *     summary: Cria uma nova dimensão
 *     tags: [Dimensões]
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
 *               numero_eixos:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Dimensão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numero:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 numero_eixos:
 *                   type: integer
 */
router.get('/', dimensoesController.getDimensoes);
router.post('/', authorize(['admin']), dimensoesController.postDimensoes);

// Rota para deletar uma dimensão pelo número
router.delete('/:numero', authorize(['admin']), dimensoesController.deleteDimensao);

// Rota para atualizar uma dimensão
router.put('/:numero', authorize(['admin']), dimensoesController.updateDimensao);

export default router;