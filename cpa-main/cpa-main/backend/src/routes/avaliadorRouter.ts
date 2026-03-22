import express from 'express';
const router = express.Router();
import * as avaliadorController from '../controllers/avaliadorController';

/**
 * @swagger
 * tags:
 *   name: Avaliadores
 *   description: Gerenciamento de usuários avaliadores externos (se aplicável)
 */

/**
 * @swagger
 * /api/avaliadores:
 *   get:
 *     summary: Lista avaliadores
 *     tags: [Avaliadores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista
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
 *                   email:
 *                     type: string
 *   post:
 *     summary: Cria avaliador
 *     tags: [Avaliadores]
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
 *               email:
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
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 */
router.get('/avaliadores', avaliadorController.getAvaliadores);
router.post('/avaliadores', avaliadorController.createAvaliador);

/**
 * @swagger
 * /api/avaliadores/{id}:
 *   get:
 *     summary: Retorna avaliador
 *     tags: [Avaliadores]
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
 *         description: Dados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *   put:
 *     summary: Atualiza avaliador
 *     tags: [Avaliadores]
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
 *               nome:
 *                 type: string
 *               email:
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
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *   delete:
 *     summary: Remove avaliador
 *     tags: [Avaliadores]
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
 *         description: Removido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Avaliador removido
 */
router.get('/avaliadores/:id', avaliadorController.getAvaliadorById);
router.put('/avaliadores/:id', avaliadorController.updateAvaliador);
router.delete('/avaliadores/:id', avaliadorController.deleteAvaliador);

export default router;
