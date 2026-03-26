import express from 'express';
const router = express.Router();
import * as municipiosController from '../controllers/municipiosController';

/**
 * @swagger
 * tags:
 *   name: Municípios
 *   description: Consulta de Municípios
 */

/**
 * @swagger
 * /api/municipios:
 *   get:
 *     summary: Lista todos os municípios
 *     tags: [Municípios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de municípios
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
router.get('/municipios', municipiosController.getMunicipios);

/**
 * @swagger
 * /api/municipios/{id}:
 *   get:
 *     summary: Retorna um município pelo ID
 *     tags: [Municípios]
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
 *         description: Dados do município
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 */
router.get('/municipios/:id', municipiosController.getMunicipioById);

export default router;
