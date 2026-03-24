import crypto from 'crypto';

/**
 * Gera um hash (HMAC-SHA-256) da matrícula para garantir o anonimato
 * mas permitindo a verificação de duplicidade por avaliação.
 *
 * Um segredo do servidor (pepper) deve ser definido em MATRICULA_HASH_SECRET.
 * Opcionalmente, um namespace (por exemplo, o id da avaliação) pode ser
 * informado para que a mesma matrícula tenha hashes diferentes por avaliação.
 *
 * Caso o segredo não esteja definido, o comportamento é o mesmo do código
 * original (SHA-256 puro), para não quebrar instalações existentes.
 */
export function hashMatricula(matricula: string, namespace?: string): string {
    const dataToHash = namespace ? `${namespace}:${matricula}` : matricula;
    const secret = process.env.MATRICULA_HASH_SECRET;

    if (secret && secret.length > 0) {
        return crypto
            .createHmac('sha256', secret)
            .update(dataToHash)
            .digest('hex');
    }

    return crypto
        .createHash('sha256')
        .update(dataToHash)
        .digest('hex');
}
