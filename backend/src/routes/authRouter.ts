import express from 'express';
import rateLimit from 'express-rate-limit';
const router = express.Router();
import * as authController from '../controllers/authController';

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
	},
	skipSuccessfulRequests: true,
});

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para login e gestão de acesso
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário usando as credenciais da universidade (UEA)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@uea.edu.br
 *               senha:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     matricula:
 *                       type: string
 *                     curso:
 *                       type: string
 *                     unidade:
 *                       type: string
 *                     categoria:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isAdmin:
 *                       type: boolean
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Credenciais inválidas ou ausentes
 *       401:
 *         description: Falha na autenticação
 */
router.post('/login', loginLimiter, authController.login);
// router.post('/login-dev', authController.loginDev);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Endpoint de registro (Atualmente não implementado)
 *     tags: [Autenticação]
 *     responses:
 *       501:
 *         description: Funcionalidade não implementada
 */
router.post('/register', authController.register);

export default router;