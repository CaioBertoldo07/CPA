/**
 * Mapeamento de Perfis Oberon para Categorias UEA
 * 
 * Perfis Oberon (O1-O8) definem o papel do usuário na universidade.
 * Cada perfil mapeia para uma ou mais categorias que determinam
 * quais avaliações o usuário pode visualizar/responder.
 */

export interface OberonProfile {
    id: number;
    nome: string;
    categorias: string[];
    descricao: string;
}

/**
 * Mapa completo de perfis Oberon com suas respectivas categorias
 */
const OBERON_PROFILES: Record<number, OberonProfile> = {
    1: {
        id: 1,
        nome: 'DISCENTE',
        categorias: ['DISCENTE'],
        descricao: 'Perfil de Alunos'
    },
    2: {
        id: 2,
        nome: 'DOCENTE',
        categorias: ['DOCENTE'],
        descricao: 'Perfil de Professores'
    },
    3: {
        id: 3,
        nome: 'TÉCNICO',
        categorias: ['TÉCNICO'],
        descricao: 'Perfil de Servidores Técnico-Administrativos'
    },
    4: {
        id: 4,
        nome: 'DISCENTE E DOCENTE',
        categorias: ['DISCENTE', 'DOCENTE'],
        descricao: 'Perfil de Discente e Docente'
    },
    5: {
        id: 5,
        nome: 'DISCENTE E TÉCNICO',
        categorias: ['DISCENTE', 'TÉCNICO'],
        descricao: 'Perfil de Discente e Técnico'
    },
    6: {
        id: 6,
        nome: 'DOCENTE E TÉCNICO',
        categorias: ['DOCENTE', 'TÉCNICO'],
        descricao: 'Perfil de Docente e Técnico'
    },
    7: {
        id: 7,
        nome: 'EXTERNO',
        categorias: ['DOCENTE'],
        descricao: 'Perfil de Docentes ou Técnicos Externos'
    },
    8: {
        id: 8,
        nome: 'ESTAGIÁRIO',
        categorias: ['TÉCNICO'],
        descricao: 'Perfil de Estagiário'
    }
};

/**
 * Obtém o perfil Oberon pelo ID
 * @param perfilId ID ou nome do perfil Oberon
 * @returns Dados do perfil ou undefined
 */
export function getOberonProfile(perfilId: string | number | undefined): OberonProfile | undefined {
    if (!perfilId) return undefined;

    // Se for número, busca direto
    if (typeof perfilId === 'number') {
        return OBERON_PROFILES[perfilId];
    }

    // Se for string, tenta converter para número
    const numId = parseInt(String(perfilId), 10);
    if (!isNaN(numId)) {
        return OBERON_PROFILES[numId];
    }

    return undefined;
}

/**
 * Obtém as categorias para um perfil Oberon
 * @param perfilId ID do perfil Oberon
 * @returns Array de categorias ou ['DISCENTE'] como fallback
 */
export function getCategoriesForProfile(perfilId: string | number | undefined): string[] {
    const profile = getOberonProfile(perfilId);
    return profile?.categorias || ['DISCENTE'];
}

/**
 * Obtém o nome do perfil Oberon
 * @param perfilId ID do perfil Oberon
 * @returns Nome do perfil ou 'DISCENTE' como fallback
 */
export function getProfileName(perfilId: string | number | undefined): string {
    const profile = getOberonProfile(perfilId);
    return profile?.nome || 'DISCENTE';
}

/**
 * Obtém uma representação em string das categorias para armazenamento
 * Utiliza ponto e vírgula como separador para múltiplas categorias
 * @param perfilId ID do perfil Oberon
 * @returns String com categorias (ex: "DISCENTE" ou "DISCENTE;DOCENTE")
 */
export function getCategoriesAsString(perfilId: string | number | undefined): string {
    const categories = getCategoriesForProfile(perfilId);
    return categories.join(';');
}

/**
 * Valida se um perfil Oberon é válido
 * @param perfilId ID do perfil Oberon
 * @returns true se válido, false caso contrário
 */
export function isValidOberonProfile(perfilId: string | number | undefined): boolean {
    return getOberonProfile(perfilId) !== undefined;
}

export default {
    OBERON_PROFILES,
    getOberonProfile,
    getCategoriesForProfile,
    getProfileName,
    getCategoriesAsString,
    isValidOberonProfile
};
