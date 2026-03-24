import crypto from 'crypto';

/**
 * Gera um hash SHA-256 da matrícula para garantir o anonimato
 * mas permitindo a verificação de duplicidade por avaliação.
 */
export function hashMatricula(matricula: string): string {
    return crypto
        .createHash('sha256')
        .update(matricula)
        .digest('hex');
}
