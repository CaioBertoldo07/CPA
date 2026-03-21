import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as modalidades
 */
const findAll = () => {
    return prisma.modalidades.findMany({
        orderBy: { id: 'asc' }
    });
};

/**
 * Busca uma modalidade pelo ID
 */
const findById = (id: number) => {
    return prisma.modalidades.findUnique({
        where: { id }
    });
};

/**
 * Busca várias modalidades pelos IDs
 */
const findByIds = (ids: number[]) => {
    return prisma.modalidades.findMany({
        where: { id: { in: ids } }
    });
};

/**
 * Cria uma nova modalidade
 */
const create = (data: Prisma.ModalidadesCreateInput) => {
    return prisma.modalidades.create({ data });
};

/**
 * Atualiza uma modalidade
 */
const update = (id: number, data: Prisma.ModalidadesUpdateInput) => {
    return prisma.modalidades.update({
        where: { id },
        data
    });
};

/**
 * Remove uma modalidade
 */
const remove = (id: number) => {
    return prisma.modalidades.delete({
        where: { id }
    });
};

export {
    findAll,
    findById,
    findByIds,
    create,
    update,
    remove,
};
