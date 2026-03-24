import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';

/**
 * Classe customizada para erros da aplicação
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Wrapper para funções assíncronas no express para evitar try-catch repetitivos
 */
export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware central de tratamento de erros
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: err.errors.join(' '),
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${req.method} ${req.url} - ${statusCode}: ${message}`);
    if (statusCode === 500) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: statusCode === 500 && process.env.NODE_ENV === 'production'
            ? 'Ocorreu um erro interno no servidor.'
            : message,
    });
};
