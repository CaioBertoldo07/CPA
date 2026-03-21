import { Request, Response } from 'express';
import eixosService from '../services/eixosService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { createEixoSchema, updateEixoSchema } from '../validators/eixosValidator';

const postEixos = asyncHandler(async (req: Request, res: Response) => {
  await createEixoSchema.validate(req.body, { abortEarly: false });
  await eixosService.create(req.body);
  res.status(200).json({ message: 'Eixo e dimensões cadastrados com sucesso.' });
});

const updateEixos = asyncHandler(async (req: Request, res: Response) => {
  const numero = parseInt(req.params.numero as string, 10);
  await updateEixoSchema.validate(req.body);
  await eixosService.update(numero, req.body.nome);
  res.status(200).json({ message: 'Eixo atualizado com sucesso.' });
});

const getEixos = asyncHandler(async (req: Request, res: Response) => {
  const eixos = await eixosService.getAll();
  res.json(eixos);
});

const getEixoByNumero = asyncHandler(async (req: Request, res: Response) => {
  const numero = parseInt(req.params.numeroEixo as string, 10);
  const eixo = await eixosService.getByNumero(numero);
  res.json(eixo);
});

const deleteEixos = asyncHandler(async (req: Request, res: Response) => {
  const numero = parseInt(req.params.numero as string, 10);
  await eixosService.delete(numero);
  res.status(200).json({ message: 'Eixo e suas dimensões deletados com sucesso.' });
});

export {
  postEixos,
  updateEixos,
  getEixos,
  getEixoByNumero,
  deleteEixos
};
