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

/**
 * @swagger
 * /api/cursos/paginated:
 *   get:
 *     summary: Lista os cursos com paginação e filtros
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Itens por página
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtro por nome do curso
 *       - in: query
 *         name: codigo
 *         schema:
 *           type: string
 *         description: Filtro por código do curso
 *       - in: query
 *         name: curso_tipo
 *         schema:
 *           type: string
 *         description: Filtro por tipo de curso
 *       - in: query
 *         name: unidade
 *         schema:
 *           type: string
 *         description: Filtro por unidade
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Filtro por município
 *     responses:
 *       200:
 *         description: Lista paginada de cursos
 */
router.get('/cursos/paginated', cursosController.getPaginatedCursos);

/**
 * @swagger
 * /api/cursos/classify:
 *   post:
 *     summary: Classifica um ou mais cursos em uma modalidade e os ativa
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cursoIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               idModalidade:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sucesso
 */
router.post('/cursos/classify', cursosController.classifyCursos);

/**
 * @swagger
 * /api/cursos/status:
 *   patch:
 *     summary: Altera o status (ativo/inativo) de um ou mais cursos
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cursoIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sucesso
 */
router.patch('/cursos/status', cursosController.updateCursosStatus);


export default router;