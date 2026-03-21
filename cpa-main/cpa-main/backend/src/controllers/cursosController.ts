import { Request, Response } from 'express';
import cursosService from '../services/cursosService';
import { asyncHandler } from '../middleware/errorMiddleware';

const getCursosByModalidade = asyncHandler(async (req: Request, res: Response) => {
    const modalidadeIds = req.query.modalidadeIds as string;

    if (!modalidadeIds) {
        return res.status(400).json({ message: "É necessário fornecer pelo menos um ID de modalidade." });
    }

    const modalidadeIdsArray = modalidadeIds.split(',').map(id => id.trim());
    if (modalidadeIdsArray.length === 0) {
        return res.status(400).json({ message: "IDs de modalidades inválidos fornecidos." });
    }

    const cursos = await cursosService.getByModalidades(modalidadeIdsArray);
    res.status(200).json(cursos);
});

const getCursosByUnidadesIds = asyncHandler(async (req: Request, res: Response) => {
    const unidadeIds = req.query.unidadeIds as string;

    if (!unidadeIds) {
        return res.status(400).json({ message: "É necessário fornecer pelo menos um ID de unidade." });
    }

    const unidadeIdsArray = unidadeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (unidadeIdsArray.length === 0) {
        return res.status(200).json([]);
    }

    const cursos = await cursosService.getByUnidades(unidadeIdsArray);
    res.status(200).json(cursos);
});

const getTodosCursos = asyncHandler(async (req: Request, res: Response) => {
    const cursos = await cursosService.getAll();
    res.status(200).json(cursos);
});

export {
    getCursosByModalidade,
    getCursosByUnidadesIds,
    getTodosCursos
};
