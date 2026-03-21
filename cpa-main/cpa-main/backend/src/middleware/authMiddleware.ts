import { Request, Response } from 'express';
require('dotenv').config(); // Carregar variáveis do .env
import jwt from 'jsonwebtoken';

function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && (authHeader as string).split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Token ausente
    }

    jwt.verify(token, (process.env.SECRET_KEY as string), (err: any, user: any) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
            }
            return res.sendStatus(403); // Outro erro, como token inválido
        }
        req.user = user;
        next();
    });
}

function authorize(requiredPermissions: any) {
    return (req: any, res: any, next: any) => {
        const isAdmin = req.user.isAdmin || false;

        if (isAdmin) {
            return next();
        }

        const userPermissions = req.user.permissions || [];
        const hasPermission = requiredPermissions.every((permission: any) =>
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
