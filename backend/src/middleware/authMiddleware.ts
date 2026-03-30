import { Request, Response, NextFunction } from 'express';
require('dotenv').config(); // Carregar variáveis do .env
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserResponseDTO } from '../dtos/AuthDTO';

const AUTH_COOKIE_NAME = 'cpa_auth';

function getCookieToken(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;

    const parts = cookieHeader.split(';');
    for (const part of parts) {
        const [name, ...valueParts] = part.trim().split('=');
        if (name === AUTH_COOKIE_NAME) {
            return decodeURIComponent(valueParts.join('='));
        }
    }

    return null;
}

const jwtUserSchema = z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'user']),
    isAdmin: z.boolean(),
    matricula: z.string().optional(),
    curso: z.string().optional(),
    categoria: z.string().optional(),
    oberonPerfilNome: z.string().optional(),
    oberonPerfilId: z.union([z.string(), z.number()]).optional(),
    nome: z.string().optional(),
    unidade: z.string().optional(),
});

function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const cookieToken = getCookieToken(req.headers.cookie);
    const token = cookieToken;

    if (!token) {
        return res.sendStatus(401); // Token ausente
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET não configurado.');
        return res.sendStatus(500);
    }

    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
            }
            return res.sendStatus(403); // Outro erro, como token inválido
        }

        const parsed = jwtUserSchema.safeParse(user);
        if (!parsed.success) {
            return res.sendStatus(403);
        }

        req.user = parsed.data as UserResponseDTO;
        next();
    });
}

function authorize(requiredRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.sendStatus(401);

        const hasRole = requiredRoles.includes(req.user.role);
        if (!hasRole) {
            return res.sendStatus(403);
        }

        next();
    };
}

export {
    authenticateToken,
    authorize
};
