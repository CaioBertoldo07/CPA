import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import avaliacoesRouter from '../../src/routes/avaliacoesRouter';
import respostasRouter from '../../src/routes/respostasRouter';
import { errorHandler } from '../../src/middleware/errorMiddleware';
import { authenticateToken } from '../../src/middleware/authMiddleware';
import { prismaMock } from '../setup';

type UserTokenPayload = {
    email: string;
    role: 'admin' | 'user';
    isAdmin: boolean;
    matricula?: string;
    curso?: string;
    categoria?: string;
    oberonPerfilNome?: string;
    unidade?: string;
    unidadeSigla?: string;
};

export function setupTestApp(): Express {
    const app = express();
    app.use(express.json());
    app.use('/api', authenticateToken, avaliacoesRouter);
    app.use('/api', authenticateToken, respostasRouter);
    app.use(errorHandler);
    return app;
}

export function createAdminToken(): string {
    const payload: UserTokenPayload = {
        email: 'admin@uea.edu.br',
        role: 'admin',
        isAdmin: true,
    };

    return jwt.sign(payload, process.env.JWT_SECRET as string);
}

export function createUserToken(
    matricula = '20250001',
    curso = 'CURSO_TESTE',
    categoria = 'DISCENTE',
    unidade = 'Escola Superior de Tecnologia',
): string {
    const payload: UserTokenPayload = {
        email: 'user@uea.edu.br',
        role: 'user',
        isAdmin: false,
        matricula,
        curso,
        categoria,
        oberonPerfilNome: categoria,
        unidade,
        unidadeSigla: 'EST',
    };

    return jwt.sign(payload, process.env.JWT_SECRET as string);
}

export function clearDatabase(): void {
    jest.clearAllMocks();

    const resetFns = (obj: Record<string, any>) => {
        for (const value of Object.values(obj)) {
            if (typeof value === 'function' && 'mockReset' in value) {
                value.mockReset();
            } else if (value && typeof value === 'object') {
                resetFns(value as Record<string, any>);
            }
        }
    };

    resetFns(prismaMock as unknown as Record<string, any>);
}
