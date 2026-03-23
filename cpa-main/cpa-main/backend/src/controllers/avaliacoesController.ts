import { Request, Response } from 'express';
import avaliacoesService from '../services/avaliacoesService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { createAvaliacaoSchema } from '../validators/avaliacoesValidator';

/**
 * Controller para gerenciamento de Avaliações
 * Implementa Clean Code e SOLID delegando lógica para o Service Layer.
 */

const createAvaliacao = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = await createAvaliacaoSchema.validate(req.body, { abortEarly: false });
    const avaliacao = await avaliacoesService.create(validatedData as any);
    res.status(201).json({ message: 'Avaliação criada com sucesso!', avaliacao });
});

const getAvaliacoes = asyncHandler(async (req: Request, res: Response) => {
    const avaliacoes = await avaliacoesService.getAll();
    res.status(200).json(avaliacoes);
});

const getAvaliacoesDisponiveis = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || !user.curso) return res.status(400).json({ error: 'Curso do usuário não encontrado no token.' });

    const avaliacoes = await avaliacoesService.getDisponiveis(user.curso, user.matricula);
    if (avaliacoes.length === 0) return res.status(404).json({ message: 'Nenhuma avaliação disponível.' });

    res.status(200).json(avaliacoes);
});

const getAvaliacaoById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const avaliacao = await avaliacoesService.getById(id, req.user);
    res.json(avaliacao);
});

const enviarAvaliacao = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const avaliacao = await avaliacoesService.switchStatus(id, 2);
    res.status(200).json({ message: 'Avaliação enviada com sucesso.', avaliacao });
});

const prorrogarAvaliacao = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const { data_fim } = req.body;
    const avaliacao = await avaliacoesService.prorrogar(id, data_fim);
    res.status(200).json({ message: 'Avaliação prorrogada com sucesso.', avaliacao });
});

const deleteAvaliacao = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await avaliacoesService.delete(id);
    res.status(200).json({ message: 'Avaliação excluída com sucesso.' });
});

const verificarSeUsuarioRespondeu = asyncHandler(async (req: Request, res: Response) => {
    const { idAvaliacao } = req.params;
    const matricula = req.user?.matricula;

    if (!matricula) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const respondeu = await avaliacoesService.hasUserResponded(matricula, parseInt(idAvaliacao, 10));
    res.status(200).json({ respondeu });
});

export {
    createAvaliacao,
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    enviarAvaliacao,
    prorrogarAvaliacao,
    deleteAvaliacao,
    verificarSeUsuarioRespondeu
};