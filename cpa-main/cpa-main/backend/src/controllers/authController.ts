import { Request, Response } from 'express';
import authService from '../services/authService';
import { asyncHandler } from '../middleware/errorMiddleware';

const loginDev = asyncHandler(async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const result = await authService.loginDev({ email, senha });
  res.json(result);
});

const getUsuario = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyUser(req.user);
  res.json(result);
});

const register = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Funcionalidade de registro não implementada neste ambiente.' });
});

export { loginDev as login, getUsuario, register };
