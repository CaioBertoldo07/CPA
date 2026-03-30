import express from 'express';
const router = express.Router();
import * as modalidadesController from '../controllers/modalidadesController';
import { authorize } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Modalidades
 *   description: Gerenciamento das Modalidades (EAD, Presencial, etc)
 */

/**
 * @swagger
 * /api/modalidades:
 *   get:
 *     summary: Lista todas as modalidades
 *     tags: [Modalidades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de modalidades
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
 *     summary: Cria uma nova modalidade
 *     tags: [Modalidades]
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
 *         description: Modalidade criada
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
router.get('/modalidades', modalidadesController.getModalidades);
router.post('/modalidades', authorize(['admin']), modalidadesController.postModalidades);

/**
 * @swagger
 * /api/modalidades/{id}:
 *   get:
 *     summary: Retorna uma modalidade pelo ID
 *     tags: [Modalidades]
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
 *         description: Dados da modalidade
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
 *     summary: Atualiza uma modalidade
 *     tags: [Modalidades]
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
 *         description: Modalidade atualizada
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
 *     summary: Remove uma modalidade
 *     tags: [Modalidades]
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
 *         description: Modalidade removida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Modalidade removida
 */
router.get('/modalidades/:id', modalidadesController.getModalidadesByNumero);
router.put('/modalidades/:id', authorize(['admin']), modalidadesController.updateModalidades);
router.delete('/modalidades/:id', authorize(['admin']), modalidadesController.deleteModalidades);

export default router;
