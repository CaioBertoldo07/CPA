import prisma from './prismaClient';

/**
 * Busca todas as unidades
 */
const findAll = () => {
    return prisma.unidades.findMany({
        orderBy: { id: 'asc' }
    });
};

/**
 * Busca uma unidade pelo ID
 */
const findById = (id: number) => {
    return prisma.unidades.findUnique({
        where: { id }
    });
};

/**
 * Busca várias unidades pelos IDs
 */
const findByIds = (ids: number[]) => {
    return prisma.unidades.findMany({
        where: { id: { in: ids } }
    });
};

/**
 * Busca várias unidades pelos nomes dos municípios
 */
const findByMunicipios = (municipiosArray: string[]) => {
    return prisma.unidades.findMany({
        where: {
            municipio_vinculo: {
                in: municipiosArray
            }
        },
        select: {
            id: true,
            nome: true,
            sigla: true,
            municipio_vinculo: true,
        }
    });
};

export {
    findAll,
    findById,
    findByIds,
    findByMunicipios,
};
