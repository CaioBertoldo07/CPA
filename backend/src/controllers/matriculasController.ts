import { Request, Response } from 'express';
import matriculasService from '../services/matriculasService';
import { asyncHandler, AppError } from '../middleware/errorMiddleware';
import { getUniversityToken } from '../services/universityTokenStore';

/**
 * POST /api/matriculados/sincronizar
 * Busca matriculados no Lyceum e atualiza o snapshot local.
 * Body: { ano: string, semestre?: string }
 */
const sincronizar = asyncHandler(async (req: Request, res: Response) => {
    const { ano, semestre } = req.body ?? {};
    if (!ano) throw new AppError('Informe o "ano".', 400);

    const user = (req as any).user;
    const universityToken = getUniversityToken(user?.email);
    if (!universityToken) {
        throw new AppError('Sessão da universidade expirada. Faça login novamente para sincronizar.', 401);
    }

    const result = await matriculasService.sincronizar(
        String(ano),
        semestre ? String(semestre) : undefined,
        universityToken,
    );
    res.status(200).json(result);
});

/**
 * GET /api/avaliacoes/:id/participacao
 * Taxa de participacao por curso (respondentes / matriculados).
 * Query opcional: ano, semestre (sobrescrevem o periodo da avaliacao).
 */
const getParticipacao = asyncHandler(async (req: Request, res: Response) => {
    const idAvaliacao = parseInt(req.params.id as string, 10);
    if (Number.isNaN(idAvaliacao)) throw new AppError('id de avaliacao invalido.', 400);
    const result = await matriculasService.getParticipacaoPorCurso(idAvaliacao);
    res.json(result);
});

export { sincronizar, getParticipacao };
