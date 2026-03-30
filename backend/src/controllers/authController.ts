import { Request, Response } from 'express';
import authService from '../services/authService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { isProduction } from '../config/env';

const AUTH_COOKIE_NAME = 'cpa_auth';

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  };
}

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const result = await authService.login({ email, senha });
  res.cookie(AUTH_COOKIE_NAME, result.token, getCookieOptions());
  res.json(result);
});

const getUsuario = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyUser(req.user as any);
  res.json(result);
});

const register = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Funcionalidade de registro não implementada neste ambiente.' });
});

const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });
  res.status(200).json({ message: 'Logout realizado com sucesso.' });
});

export { login, getUsuario, register, logout };
