import { Request, Response } from 'express';
import padraoRespostaService from '../services/padraoRespostaService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { padraoRespostaSchema } from '../validators/patternValidators';

const getPadraoResposta = asyncHandler(async (req: Request, res: Response) => {
    const padroes = await padraoRespostaService.getAll();
    res.json(padroes);
});

const getPadraoRespostaById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const padrao = await padraoRespostaService.getById(id);
    res.json(padrao);
});

const postPadraoResposta = asyncHandler(async (req: Request, res: Response) => {
    await padraoRespostaSchema.validate(req.body);
    const padrao = await padraoRespostaService.create(req.body.sigla);
    res.status(201).json({
        message: 'Padrão de resposta cadastrado com sucesso!',
        padrao
    });
});

const putPadraoResposta = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await padraoRespostaSchema.validate(req.body);
    const padrao = await padraoRespostaService.update(id, req.body.sigla);
    res.status(200).json({
        message: 'Padrão de resposta atualizado com sucesso!',
        padrao
    });
});

const deletePadraoResposta = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await padraoRespostaService.delete(id);
    res.status(200).json({ message: 'Padrão de resposta deletado com sucesso!' });
});

export {
    getPadraoResposta,
    getPadraoRespostaById,
    postPadraoResposta,
    putPadraoResposta,
    deletePadraoResposta,
};
