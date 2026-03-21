import { Request, Response } from 'express';
import unidadesService from '../services/unidadesService';
import { asyncHandler } from '../middleware/errorMiddleware';

const getUnidades = asyncHandler(async (req: Request, res: Response) => {
    const unidades = await unidadesService.getAll();
    res.json(unidades);
});

const getUnidadeById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const unidade = await unidadesService.getById(id);
    res.json(unidade);
});

const getUnidadesByMunicipios = asyncHandler(async (req: Request, res: Response) => {
    const { municipiosNomes } = req.query;
    if (!municipiosNomes) {
        return res.status(400).json({ message: "É necessário fornecer pelo menos um nome de município." });
    }

    const municipiosArray = (municipiosNomes as string).split(',').map(nome => nome.trim());
    const unidades = await unidadesService.getByMunicipios(municipiosArray);

    if (unidades.length === 0) {
        return res.status(404).json({ message: 'Nenhuma unidade encontrada para os municípios fornecidos.' });
    }

    res.json(unidades);
});

export {
    getUnidades,
    getUnidadeById,
    getUnidadesByMunicipios
};
