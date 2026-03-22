import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/adminController';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gerenciamento de Administradores
 */

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Lista todos os administradores
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de administradores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome:
 *                     type: string
 *                   email:
 *                     type: string
 *   post:
 *     summary: Cria um novo administrador
 *     tags: [Admin]
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
 *         description: Administrador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 */
router.get('/admin', adminController.getAllAdmins);
router.post('/admin', adminController.postAdmin);

/**
 * @swagger
 * /api/admin/{email}:
 *   put:
 *     summary: Atualiza os dados de um administrador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Administrador atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *   delete:
 *     summary: Remove um administrador pelo email
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Administrador removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin deletado com sucesso
 */
router.put('/admin/:email', adminController.updateAdmin);
router.delete('/admin/:email', adminController.deleteAdmin);

export default router;
