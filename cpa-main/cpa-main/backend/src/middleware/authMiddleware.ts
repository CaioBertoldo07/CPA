import { Request, Response, NextFunction } from 'express';
require('dotenv').config(); // Carregar variáveis do .env
import jwt from 'jsonwebtoken';
import { UserResponseDTO } from '../dtos/AuthDTO';

function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && (authHeader as string).split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Token ausente
    }

    jwt.verify(token, (process.env.SECRET_KEY || 'secret'), (err: any, user: any) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
            }
            return res.sendStatus(403); // Outro erro, como token inválido
        }
        req.user = user as UserResponseDTO & { role: string };
        next();
    });
}

function authorize(requiredPermissions: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.sendStatus(401);

        const isAdmin = req.user.role === 'admin';

        if (isAdmin) {
            return next();
        }

        // Se houver permissões específicas futuramente
        const userPermissions: string[] = (req.user as any).permissions || [];
        const hasPermission = requiredPermissions.every((permission: string) =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.sendStatus(403);
        }

        next();
    };
}

export {
    authenticateToken,
    authorize
};
