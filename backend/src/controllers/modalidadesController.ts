import { Request, Response } from 'express';
import modalidadesService from '../services/modalidadesService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { modalidadeSchema } from '../validators/utilityValidators';

const getModalidades = asyncHandler(async (req: Request, res: Response) => {
    const modalidades = await modalidadesService.getAll();
    res.json(modalidades);
});

const getModalidadesByNumero = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const modalidade = await modalidadesService.getById(id);
    res.json(modalidade);
});

const postModalidades = asyncHandler(async (req: Request, res: Response) => {
    await modalidadeSchema.validate(req.body);
    const novaModalidade = await modalidadesService.create(req.body);
    res.status(200).json({ message: 'Modalidade cadastrada com sucesso.', modalidade: novaModalidade });
});

const updateModalidades = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await modalidadeSchema.validate(req.body);
    const modalidadeAtualizada = await modalidadesService.update(id, req.body);
    res.status(200).json({ message: 'Modalidade atualizada com sucesso.', modalidade: modalidadeAtualizada });
});

const deleteModalidades = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await modalidadesService.delete(id);
    res.status(200).json({ message: 'Modalidade deletada com sucesso.' });
});

export {
    postModalidades,
    getModalidades,
    updateModalidades,
    getModalidadesByNumero,
    deleteModalidades
};