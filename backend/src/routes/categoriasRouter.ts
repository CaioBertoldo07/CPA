import express from 'express';
const router = express.Router();
import * as categoriasController from '../controllers/categoriasController';

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Categorias de avaliadores (somente leitura — DISCENTE, DOCENTE, TÉCNICO)
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Retorna a lista de categorias (somente leitura)
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias fixas
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
router.get('/categorias', categoriasController.getCategorias);

export default router;