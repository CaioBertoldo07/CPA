import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { solicitarCetic } from '../services/ceticService';

export const solicitarCeticController = asyncHandler(async (req: Request, res: Response) => {
    const avaliacaoId = parseInt(req.params.id as string, 10);
    const adminEmail = req.user?.email ?? 'desconhecido';

    const result = await solicitarCetic(avaliacaoId, adminEmail);

    const httpStatus = result.status === 'SENT' ? 200
        : result.status === 'ALREADY_REQUESTED' ? 200
        : 200;

    res.status(httpStatus).json({ ...result });
});
