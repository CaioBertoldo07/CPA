import { Request, Response } from 'express';
import categoriasService from '../services/categoriasService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { categoriaSchema } from '../validators/utilityValidators';

const getCategorias = asyncHandler(async (req: Request, res: Response) => {
    const categorias = await categoriasService.getAll();
    res.json(categorias);
});

const postCategorias = asyncHandler(async (req: Request, res: Response) => {
    await categoriaSchema.validate(req.body);
    const novaCategoria = await categoriasService.create(req.body.nome);
    res.status(201).json({
        message: 'Categoria cadastrada com sucesso!',
        categoria: novaCategoria,
    });
});

const deleteCategorias = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await categoriasService.delete(id);
    res.status(200).json({ message: 'Categoria deletada com sucesso!' });
});

const updateCategorias = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await categoriaSchema.validate(req.body);
    const categoriaAtualizada = await categoriasService.update(id, req.body.nome);
    res.status(200).json({
        message: 'Categoria atualizada com sucesso!',
        categoria: categoriaAtualizada,
    });
});

export {
    getCategorias,
    postCategorias,
    deleteCategorias,
    updateCategorias
};