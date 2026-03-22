import express from 'express';
const router = express.Router();
import * as unidadesController from '../controllers/unidadesController';

/**
 * @swagger
 * tags:
 *   name: Unidades
 *   description: Gerenciamento de Unidades da universidade
 */

/**
 * @swagger
 * /api/unidades:
 *   get:
 *     summary: Lista todas as unidades
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa
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
router.get('/unidades', unidadesController.getUnidades);

/**
 * @swagger
 * /api/unidades/municipios:
 *   get:
 *     summary: Retorna unidades vinculadas a múltiplos municípios
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *         description: Lista de IDs de municípios separados por vírgula
 *     responses:
 *       200:
 *         description: Lista de unidades
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
router.get('/unidades/municipios', unidadesController.getUnidadesByMunicipios);

/**
 * @swagger
 * /api/unidades/{id}:
 *   get:
 *     summary: Retorna uma unidade específica pelo ID
 *     tags: [Unidades]
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
 *         description: Unidade retornada
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
router.get('/unidades/:id', unidadesController.getUnidadeById);




export default router;
