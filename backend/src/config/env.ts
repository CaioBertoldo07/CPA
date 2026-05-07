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
    APP_PUBLIC_URL: z.string().url().optional(),

    // E-mail / CETIC — validados no momento do envio, não no startup
    MAIL_FROM: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z.enum(['true', 'false']).optional().default('false'),
    CETIC_EMAIL_TO: z.string().optional(),
    CETIC_EMAIL_CC: z.string().optional(),
    CETIC_REQUEST_IDEMPOTENCY_WINDOW_MINUTES: z.coerce.number().int().positive().optional().default(10),
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
    APP_PUBLIC_URL: parsed.data.APP_PUBLIC_URL ||
        (parsed.data.NODE_ENV !== 'production' ? 'http://localhost:5173' : undefined),

    MAIL_FROM: parsed.data.MAIL_FROM,
    SMTP_HOST: parsed.data.SMTP_HOST,
    SMTP_PORT: parsed.data.SMTP_PORT,
    SMTP_USER: parsed.data.SMTP_USER,
    SMTP_PASS: parsed.data.SMTP_PASS,
    SMTP_SECURE: parsed.data.SMTP_SECURE === 'true',
    CETIC_EMAIL_TO: parsed.data.CETIC_EMAIL_TO,
    CETIC_EMAIL_CC: parsed.data.CETIC_EMAIL_CC,
    CETIC_REQUEST_IDEMPOTENCY_WINDOW_MINUTES: parsed.data.CETIC_REQUEST_IDEMPOTENCY_WINDOW_MINUTES,
};

export const isProduction = env.NODE_ENV === 'production';
