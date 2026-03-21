import prisma from './prismaClient';

/**
 * Busca todos os tipos de questões
 */
const findAll = () => {
    return prisma.questoes_tipo.findMany({
        orderBy: { id: 'asc' }
    });
};

/**
 * Busca um tipo de questão pelo ID
 */
const findById = (id: number) => {
    return prisma.questoes_tipo.findUnique({
        where: { id }
    });
};

export {
    findAll,
    findById,
};
