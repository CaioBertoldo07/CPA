import express from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import * as matriculasController from '../controllers/matriculasController';

const router = express.Router();

/**
 * @swagger
 * /api/matriculados/sincronizar:
 *   post:
 *     summary: Sincroniza o snapshot de matriculados a partir do Lyceum
 *     tags: [Matriculados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ano]
 *             properties:
 *               ano:
 *                 type: string
 *                 example: "2024"
 *               semestre:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Resumo da sincronizacao
 */
router.post('/matriculados/sincronizar', authenticateToken, authorize(['admin']), matriculasController.sincronizar);

/**
 * @swagger
 * /api/avaliacoes/{id}/participacao:
 *   get:
 *     summary: Taxa de participacao por curso (respondentes / matriculados)
 *     tags: [Matriculados]
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
 *         description: Participacao por curso e totais (periodo derivado da avaliacao)
 */
router.get('/avaliacoes/:id/participacao', authenticateToken, authorize(['admin']), matriculasController.getParticipacao);

export default router;
