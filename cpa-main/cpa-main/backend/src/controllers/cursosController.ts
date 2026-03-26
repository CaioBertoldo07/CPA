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

const getPaginatedCursos = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 10));

    const filters = {
        nome: req.query.nome as string,
        codigo: req.query.codigo as string,
        curso_tipo: req.query.curso_tipo as string,
        unidade: req.query.unidade as string,
        municipio: req.query.municipio as string,
        unidadeIds: req.query.unidadeIds as string,
        municipioIds: req.query.municipioIds as string,
        modalidadeIds: req.query.modalidadeIds as string,
        unclassified: req.query.unclassified as string,
        ativo: req.query.ativo as string, // ✅ novo
    };

    const result = await cursosService.getPaginated({ page, pageSize, filters });
    res.status(200).json(result);
});
const classifyCursos = asyncHandler(async (req: Request, res: Response) => {
    const { cursoIds, idModalidade } = req.body;

    if (!Array.isArray(cursoIds) || !idModalidade) {
        return res.status(400).json({ message: "IDs dos cursos e ID da modalidade são obrigatórios." });
    }

    const result = await cursosService.classifyCursos(cursoIds, idModalidade);
    res.status(200).json({ message: "Cursos classificados com sucesso.", result });
});

const updateCursosStatus = asyncHandler(async (req: Request, res: Response) => {
    const { cursoIds, ativo } = req.body;

    if (!Array.isArray(cursoIds) || typeof ativo !== 'boolean') {
        return res.status(400).json({ message: "IDs dos cursos e status (ativo) são obrigatórios." });
    }

    const result = await cursosService.updateStatus(cursoIds, ativo);
    res.status(200).json({ message: "Status dos cursos atualizado com sucesso.", result });
});

const getUniqueTypes = asyncHandler(async (req: Request, res: Response) => {
    const result = await cursosService.getUniqueTypes();
    res.status(200).json(result);
});

export {
    getCursosByModalidade,
    getCursosByUnidadesIds,
    getTodosCursos,
    getPaginatedCursos,
    classifyCursos,
    updateCursosStatus,
    getUniqueTypes
};
