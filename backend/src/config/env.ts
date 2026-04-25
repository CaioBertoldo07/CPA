import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3034),
    JWT_SECRET: z.string().min(32),
    IMPORT_CURSOS_ON_START: z.enum(['true', 'false']).optional().default('false'),
    DISABLE_SSL_VALIDATION: z.enum(['true', 'false']).optional().default('false'),
    ALLOWED_ORIGINS: z.string().optional(),
    ENABLE_SWAGGER: z.enum(['true', 'false']).optional().default('true'),
    SWAGGER_SERVER_URL: z.string().optional(),
    LYCEUM_API_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

const allowedOrigins = parsed.data.ALLOWED_ORIGINS
    ? parsed.data.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3050', 'http://localhost:5173'];

export const env = {
    ...parsed.data,
    IMPORT_CURSOS_ON_START: parsed.data.IMPORT_CURSOS_ON_START === 'true',
    DISABLE_SSL_VALIDATION: parsed.data.DISABLE_SSL_VALIDATION === 'true',
    ENABLE_SWAGGER: parsed.data.ENABLE_SWAGGER === 'true',
    ALLOWED_ORIGINS: allowedOrigins,
    LYCEUM_API_BASE_URL: parsed.data.LYCEUM_API_BASE_URL || (parsed.data.NODE_ENV === 'production'
        ? 'https://api.uea.edu.br'
        : 'https://homolog-api.uea.edu.br'),
};

export const isProduction = env.NODE_ENV === 'production';
