import { Request, Response } from 'express';
import municipiosService from '../services/municipiosService';
import { asyncHandler } from '../middleware/errorMiddleware';

const getMunicipios = asyncHandler(async (req: Request, res: Response) => {
    const municipios = await municipiosService.getAll();
    res.json(municipios);
});

const getMunicipioById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const municipio = await municipiosService.getById(id);
    res.json(municipio);
});

export {
    getMunicipios,
    getMunicipioById
};
