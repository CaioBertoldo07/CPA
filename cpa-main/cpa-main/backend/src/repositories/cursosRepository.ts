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
        unidadeIds?: string;
        municipioIds?: string;
        modalidadeIds?: string;
        unclassified?: string;
        ativo?: string; // ✅ novo
    }
}) => {
    const { page, pageSize, filters } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters) {
        if (filters.nome) {
            where.OR = [
                { nome: { contains: filters.nome, mode: 'insensitive' } },
                { identificador_api_lyceum: { contains: filters.nome, mode: 'insensitive' } }
            ];
        }
        if (filters.curso_tipo) {
            const tipos = Array.isArray(filters.curso_tipo)
                ? filters.curso_tipo
                : filters.curso_tipo.split(',').map(t => t.trim().toUpperCase());
            where.curso_tipo = { in: tipos };
        }
        if (filters.unidade) {
            where.unidades = { nome: { contains: filters.unidade, mode: 'insensitive' } };
        }
        if (filters.municipio) {
            where.municipio = { nome: { contains: filters.municipio, mode: 'insensitive' } };
        }
        if (filters.unidadeIds) {
            const ids = filters.unidadeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (ids.length > 0) where.id_unidades = { in: ids };
        }
        if (filters.municipioIds) {
            const ids = filters.municipioIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (ids.length > 0) where.municipio_sede = { in: ids };
        }
        if (filters.modalidadeIds) {
            const ids = filters.modalidadeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (ids.length > 0) where.id_modalidade = { in: ids };
        }
        if (filters.unclassified === 'true') {
            where.id_modalidade = null;
        }
        // ✅ filtro de status server-side
        if (filters.ativo === 'true') where.ativo = true;
        if (filters.ativo === 'false') where.ativo = false;
    }

    const [totalCount, items] = await Promise.all([
        prisma.cursos.count({ where }),
        prisma.cursos.findMany({
            where,
            skip,
            take: pageSize,
            include: { unidades: true, municipio: true, modalidade_rel: true },
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

/**
 * Atualiza a modalidade de vários cursos e os ativa
 */
const updateManyModality = (cursoIds: number[], idModalidade: number) => {
    return prisma.cursos.updateMany({
        where: { id: { in: cursoIds } },
        data: {
            id_modalidade: idModalidade,
            ativo: true
        }
    });
};

/**
 * Atualiza o status ativo de vários cursos
 */
const updateManyStatus = async (ids: number[], ativo: boolean) => {
    return prisma.cursos.updateMany({
        where: { id: { in: ids } },
        data: { ativo }
    });
};

/**
 * Busca tipos de curso únicos
 */
const getUniqueTypes = async () => {
    const types = await prisma.cursos.findMany({
        select: { curso_tipo: true },
        distinct: ['curso_tipo'],
        where: { curso_tipo: { not: null } }
    });
    return types.map(t => t.curso_tipo as string).sort();
};

export {
    findAll,
    findByIdentificador,
    findByIdentificadores,
    findByModalidades,
    findByUnidades,
    findPaginated,
    updateManyModality,
    updateManyStatus,
    getUniqueTypes,
};
