import { Request, Response } from 'express';
import questoesService from '../services/questoesService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { createQuestaoSchema, updateQuestaoSchema } from '../validators/questoesValidator';

/**
 * Controller para gerenciamento de Questões
 * Segue princípios SOLID (S - Single Responsibility) e Clean Architecture.
 */

const getQuestoes = asyncHandler(async (req: Request, res: Response) => {
    const questoes = await questoesService.getAll();
    res.json(questoes);
});

const getQuestaoById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const questao = await questoesService.getById(id);
    res.json(questao);
});

const postQuestoes = asyncHandler(async (req: Request, res: Response) => {
    // Validação com Yup
    const validatedData = await createQuestaoSchema.validate(req.body, { abortEarly: false });

    const newQuestao = await questoesService.create(validatedData as any);
    res.status(201).json({
        message: 'Questão criada com sucesso!',
        questao: newQuestao
    });
});

const updateQuestoes = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);

    // Validação com Yup
    const validatedData = await updateQuestaoSchema.validate(req.body, { abortEarly: false });

    const updatedQuestao = await questoesService.update(id, validatedData as any);
    res.status(200).json({
        message: 'Questão atualizada com sucesso!',
        questao: updatedQuestao
    });
});

const deleteQuestoes = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await questoesService.delete(id);
    res.status(200).json({ message: 'Questão deletada com sucesso!' });
});

export {
    getQuestoes,
    postQuestoes,
    deleteQuestoes,
    updateQuestoes,
    getQuestaoById,
};
