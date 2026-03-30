import { Request, Response } from 'express';
import dimensoesService from '../services/dimensoesService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { createDimensaoSchema, updateDimensaoSchema } from '../validators/dimensoesValidator';

const postDimensoes = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = await createDimensaoSchema.validate(req.body);
    const novaDimensao = await dimensoesService.create(validatedData as any);
    res.json(novaDimensao);
});

const getNumeroEixoByDimensao = asyncHandler(async (req: Request, res: Response) => {
    const numeroDimensao = parseInt(req.params.numeroDimensao as string, 10);
    const dimensao = await dimensoesService.getByNumero(numeroDimensao);
    res.json({ numero_eixos: dimensao.numero_eixos });
});

const getDimensoes = asyncHandler(async (req: Request, res: Response) => {
    const dimensoes = await dimensoesService.getAll();
    res.json(dimensoes);
});

const getDimensaoByNumero = asyncHandler(async (req: Request, res: Response) => {
    const numero = parseInt(req.params.numero as string, 10);
    const dimensao = await dimensoesService.getByNumero(numero);
    res.json(dimensao);
});

const getDimensoesByEixo = asyncHandler(async (req: Request, res: Response) => {
    const numeroEixo = parseInt(req.params.numeroEixo as string, 10);
    const dimensoes = await dimensoesService.getByEixo(numeroEixo);
    res.json(dimensoes);
});

const updateDimensao = asyncHandler(async (req: Request, res: Response) => {
    const numero = parseInt(req.params.numero as string, 10);
    if (Number.isNaN(numero)) {
        res.status(400).json({ message: 'Parâmetro número inválido.' });
        return;
    }
    const validatedData = await updateDimensaoSchema.validate(req.body);
    const dimensaoAtualizada = await dimensoesService.update(numero, validatedData as any);
    res.json(dimensaoAtualizada);
});

const deleteDimensao = asyncHandler(async (req: Request, res: Response) => {
    const numero = parseInt(req.params.numero as string, 10);
    await dimensoesService.delete(numero);
    res.status(200).json({ message: 'Dimensão deletada com sucesso.' });
});

export {
    getDimensoesByEixo,
    getDimensoes,
    postDimensoes,
    getDimensaoByNumero,
    updateDimensao,
    deleteDimensao,
    getNumeroEixoByDimensao
};
