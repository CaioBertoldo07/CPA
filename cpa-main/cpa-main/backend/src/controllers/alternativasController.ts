import { Request, Response } from 'express';
import alternativasService from '../services/alternativasService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { alternativaSchema } from '../validators/patternValidators';

const getAlternativas = asyncHandler(async (req: Request, res: Response) => {
    const alternativas = await alternativasService.getAll();
    res.json(alternativas);
});

const getAlternativaById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const alternativa = await alternativasService.getById(id);
    res.json(alternativa);
});

const getAlternativasByPadraoRespostaId = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const alternativas = await alternativasService.getByPadrao(id);
    res.json(alternativas);
});

const postAlternativas = asyncHandler(async (req: Request, res: Response) => {
    await alternativaSchema.validate(req.body);
    const alternativa = await alternativasService.create(req.body);
    res.status(201).json({
        message: 'Alternativa cadastrada com sucesso!',
        alternativa
    });
});

const putAlternativas = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await alternativaSchema.validate(req.body);
    const alternativa = await alternativasService.update(id, req.body);
    res.status(200).json({
        message: 'Alternativa atualizada com sucesso!',
        alternativa
    });
});

const deleteAlternativas = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await alternativasService.delete(id);
    res.status(200).json({ message: 'Alternativa deletada com sucesso!' });
});

export {
    getAlternativas,
    getAlternativaById,
    getAlternativasByPadraoRespostaId,
    postAlternativas,
    putAlternativas,
    deleteAlternativas,
};