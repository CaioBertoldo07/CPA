import prisma from './prismaClient';

/**
 * Busca todos os cursos
 */
const findAll = () => {
    return prisma.cursos.findMany({
        orderBy: { nome: 'asc' }
    });
};

/**
 * Busca curso pelo identificador Lyceum
 */
const findByIdentificador = (identificador: string) => {
    return prisma.cursos.findUnique({
        where: { identificador_api_lyceum: identificador }
    });
};

/**
 * Busca vários cursos pelos identificadores
 */
const findByIdentificadores = (identificadores: string[]) => {
    return prisma.cursos.findMany({
        where: { identificador_api_lyceum: { in: identificadores } }
    });
};

/**
 * Busca cursos por modalidades
 */
const findByModalidades = (modalidadeNames: string[]) => {
    return prisma.cursos.findMany({
        where: {
            modalidade: { in: modalidadeNames }
        },
        select: {
            id: true,
            identificador_api_lyceum: true,
            nome: true,
            nivel: true,
            modalidade: true,
            modalidade_api: true
        }
    });
};

/**
 * Busca cursos por IDs de unidades
 */
const findByUnidades = (unidadeIds: number[]) => {
    return prisma.cursos.findMany({
        where: {
            id_unidades: { in: unidadeIds }
        },
        select: {
            id: true,
            identificador_api_lyceum: true,
            nome: true,
            nivel: true,
            modalidade: true,
            modalidade_api: true
        }
    });
};

export {
    findAll,
    findByIdentificador,
    findByIdentificadores,
    findByModalidades,
    findByUnidades,
};
