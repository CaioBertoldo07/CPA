import prisma from './prismaClient';

type CursosFilters = {
    nome?: string;
    codigo?: string;
    curso_tipo?: string;
    unidade?: string;
    municipio?: string;
    unidadeIds?: string;
    municipioIds?: string;
    modalidadeIds?: string;
    unclassified?: string;
    ativo?: string;
};

const buildCursosWhere = async (filters?: CursosFilters) => {
    const where: any = {};
    const andConditions: any[] = [];

    if (!filters) return where;

    if (filters.nome) {
        andConditions.push({ OR: [
            { nome: { contains: filters.nome, mode: 'insensitive' } },
            { identificador_api_lyceum: { contains: filters.nome, mode: 'insensitive' } }
        ]});
    }

    if (filters.curso_tipo) {
        const tipos = Array.isArray(filters.curso_tipo)
            ? filters.curso_tipo
            : filters.curso_tipo.split(',').map(t => t.trim().toUpperCase());
        andConditions.push({ curso_tipo: { in: tipos } });
    }

    if (filters.unidade) {
        andConditions.push({ unidades: { nome: { contains: filters.unidade, mode: 'insensitive' } } });
    }

    if (filters.municipio) {
        andConditions.push({ municipio: { nome: { contains: filters.municipio, mode: 'insensitive' } } });
    }

    if (filters.unidadeIds) {
        const ids = filters.unidadeIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        if (ids.length > 0) andConditions.push({ id_unidades: { in: ids } });
    }

    if (filters.municipioIds) {
        const ids = filters.municipioIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        if (ids.length > 0) andConditions.push({ municipio_sede: { in: ids } });
    }

    if (filters.modalidadeIds) {
        const ids = filters.modalidadeIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        if (ids.length > 0) {
            const modalidades = await prisma.modalidades.findMany({
                where: { id: { in: ids } },
                select: { mod_ensino: true },
            });

            const modalidadeNomes = modalidades
                .map(m => (m.mod_ensino || '').trim().toUpperCase())
                .filter(Boolean);

            andConditions.push({
                OR: [
                    { id_modalidade: { in: ids } },
                    ...(modalidadeNomes.length > 0 ? [{ curso_tipo: { in: modalidadeNomes } }] : []),
                ],
            });
        }
    }

    if (filters.unclassified === 'true') {
        andConditions.push({ id_modalidade: null });
    }

    if (filters.ativo === 'true') andConditions.push({ ativo: true });
    if (filters.ativo === 'false') andConditions.push({ ativo: false });

    if (andConditions.length > 0) {
        where.AND = andConditions;
    }

    return where;
};

/**
 * Busca todos os cursos
 */
const findAll = async (filters?: CursosFilters) => {
    const where = await buildCursosWhere(filters);

    return prisma.cursos.findMany({
        where,
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
const findByModalidades = (modalidadeIds: number[]) => {
    return prisma.cursos.findMany({
        where: {
            id_modalidade: { in: modalidadeIds }
        },
        orderBy: { nome: 'asc' },
        select: {
            id: true,
            identificador_api_lyceum: true,
            nome: true,
            nivel: true,
            curso_tipo: true,
            id_modalidade: true
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
            id_modalidade: true,
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
    filters?: CursosFilters
}) => {
    const { page, pageSize, filters } = params;
    const skip = (page - 1) * pageSize;
    const where = await buildCursosWhere(filters);

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
const updateManyModality = async (cursoIds: number[], idModalidade: number) => {
    const modalidade = await prisma.modalidades.findUnique({
        where: { id: idModalidade },
        select: { mod_ensino: true, mod_oferta: true },
    });

    if (!modalidade) {
        throw new Error('Modalidade não encontrada para classificação dos cursos.');
    }

    return prisma.cursos.updateMany({
        where: { id: { in: cursoIds } },
        data: {
            id_modalidade: idModalidade,
            modalidade: modalidade.mod_ensino,
            modalidade_api: modalidade.mod_oferta ?? null,
            ativo: true,
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
