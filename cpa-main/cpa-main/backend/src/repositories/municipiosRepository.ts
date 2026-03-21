import prisma from './prismaClient';

/**
 * Busca todos os municípios
 */
const findAll = () => {
    return prisma.municipios.findMany({
        select: {
            id: true,
            nome: true,
            UF: true,
        },
        orderBy: {
            id: 'asc'
        }
    });
};

/**
 * Busca um município pelo ID
 */
const findById = (id: number) => {
    return prisma.municipios.findUnique({
        where: { id },
        select: {
            id: true,
            nome: true,
            UF: true,
        }
    });
};

export {
    findAll,
    findById,
};
