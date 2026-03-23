// routes/cursos.js
import express from 'express';
const router = express.Router();
import * as cursosController from '../controllers/cursosController';

// Endpoint para obter cursos por unidade

/**
 * @swagger
 * tags:
 *   name: Cursos
 *   description: Gerenciamento dos Cursos da universidade
 */

/**
 * @swagger
 * /api/cursos:
 *   get:
 *     summary: Lista todos os cursos
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos
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
 *                   unidadeId:
 *                     type: integer
 *                   modalidadeId:
 *                     type: integer
 */
router.get('/cursos', cursosController.getTodosCursos);

/**
 * @swagger
 * /api/cursos/by-unidades:
 *   get:
 *     summary: Lista os cursos filtrando por unidades
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos pelas unidades
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
 *                   unidadeId:
 *                     type: integer
 *                   modalidadeId:
 *                     type: integer
 */
router.get('/cursos/by-unidades', cursosController.getCursosByUnidadesIds);

/**
 * @swagger
 * /api/cursos/by-modalidades:
 *   get:
 *     summary: Lista os cursos filtrando por modalidades
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos pelas modalidades
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
 *                   unidadeId:
 *                     type: integer
 *                   modalidadeId:
 *                     type: integer
 */
router.get('/cursos/by-modalidades', cursosController.getCursosByModalidade);


export default router;