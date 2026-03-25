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

/**
 * Busca cursos com paginação e filtros
 */
const findPaginated = async (params: {
    page: number;
    pageSize: number;
    filters?: {
        nome?: string;
        codigo?: string;
        curso_tipo?: string;
        unidade?: string;
        municipio?: string;
    }
}) => {
    const { page, pageSize, filters } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters) {
        if (filters.nome) {
            where.nome = { contains: filters.nome, mode: 'insensitive' };
        }
        if (filters.codigo) {
            where.identificador_api_lyceum = { contains: filters.codigo, mode: 'insensitive' };
        }
        if (filters.curso_tipo) {
            where.curso_tipo = { contains: filters.curso_tipo, mode: 'insensitive' };
        }
        if (filters.unidade) {
            where.unidades = {
                nome: { contains: filters.unidade, mode: 'insensitive' }
            };
        }
        if (filters.municipio) {
            where.municipio = {
                nome: { contains: filters.municipio, mode: 'insensitive' }
            };
        }
    }

    const [totalCount, items] = await Promise.all([
        prisma.cursos.count({ where }),
        prisma.cursos.findMany({
            where,
            skip,
            take: pageSize,
            include: {
                unidades: true,
                municipio: true,
                modalidade_rel: true
            },
            orderBy: { nome: 'asc' }
        })
    ]);

    return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page
    };
};

export {
    findAll,
    findByIdentificador,
    findByIdentificadores,
    findByModalidades,
    findByUnidades,
    findPaginated,
};
