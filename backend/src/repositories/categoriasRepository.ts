import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as categorias
 */
const findAll = () => {
    return prisma.categorias.findMany({
        orderBy: { id: 'asc' }
    });
};

/**
 * Busca uma categoria pelo ID
 */
const findById = (id: number) => {
    return prisma.categorias.findUnique({
        where: { id }
    });
};

/**
 * Busca várias categorias pelos IDs
 */
const findByIds = (ids: number[]) => {
    return prisma.categorias.findMany({
        where: { id: { in: ids } }
    });
};

/**
 * Cria uma nova categoria
 */
const create = (data: Prisma.CategoriasCreateInput) => {
    return prisma.categorias.create({ data });
};

/**
 * Atualiza uma categoria
 */
const update = (id: number, data: Prisma.CategoriasUpdateInput) => {
    return prisma.categorias.update({
        where: { id },
        data
    });
};

/**
 * Remove uma categoria
 */
const remove = (id: number) => {
    return prisma.categorias.delete({
        where: { id }
    });
};

/**
 * Busca uma categoria pelo nome (case-insensitive)
 */
const findByNome = (nome: string) => {
    return prisma.categorias.findFirst({
        where: { nome: { equals: nome.toLowerCase(), mode: 'insensitive' } }
    });
};

export {
    findAll,
    findById,
    findByIds,
    create,
    update,
    remove,
    findByNome,
};
