import express from 'express';
import rateLimit from 'express-rate-limit';
const router = express.Router();
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

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
 *                     oberonPerfilNome:
 *                       type: string
 *                     oberonPerfilId:
 *                       oneOf:
 *                         - type: string
 *                         - type: integer
 *                     usuarioNome:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isAdmin:
 *                       type: boolean
 *       400:
 *         description: Credenciais inválidas ou ausentes
 *       401:
 *         description: Falha na autenticação
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado pela sessão atual
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 matricula:
 *                   type: string
 *                 curso:
 *                   type: string
 *                 unidade:
 *                   type: string
 *                 categoria:
 *                   type: string
 *                 oberonPerfilNome:
 *                   type: string
 *                 oberonPerfilId:
 *                   oneOf:
 *                     - type: string
 *                     - type: integer
 *                 usuarioNome:
 *                   type: string
 *                 role:
 *                   type: string
 *                 isAdmin:
 *                   type: boolean
 *       401:
 *         description: Sessão ausente ou expirada
 */
router.get('/me', authenticateToken, authController.getUsuario);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Encerra a sessão atual do usuário autenticado
 *     tags: [Autenticação]
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso.
 */
router.post('/logout', authController.logout);
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