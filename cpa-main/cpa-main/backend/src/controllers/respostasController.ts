import { Request, Response } from 'express';
import respostasService from '../services/respostasService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { salvarRespostasSchema } from '../validators/respostasValidator';

/**
 * Controller para gerenciamento de Respostas
 * Implementa Clean Code e SOLID delegando lógica para o RespostasService.
 */

const salvarRespostas = asyncHandler(async (req: Request, res: Response) => {
    // Validação
    await salvarRespostasSchema.validate(req.body, { abortEarly: false });

    const user = (req as any).user;
    await respostasService.salvar({ ...req.body, universityToken: user.universityToken }, user.matricula);

    res.status(201).json({ message: 'Respostas salvas com sucesso!' });
});

const getRespostasByAvaliacao = asyncHandler(async (req: Request, res: Response) => {
    const idAvaliacao = parseInt(req.params.idAvaliacao as string, 10);
    const relatorio = await respostasService.getRespostasRelatorio(idAvaliacao);
    res.json(relatorio);
});

const getDashboardCategorias = asyncHandler(async (_req: Request, res: Response) => {
    const data = await respostasService.getDashboardCategorias();
    res.json(data);
});

export {
    salvarRespostas,
    getRespostasByAvaliacao,
    getDashboardCategorias,
};
