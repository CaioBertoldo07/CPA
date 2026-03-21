import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as dimensões
 */
const findAll = () => {
    return prisma.dimensoes.findMany({
        include: { eixos: true },
        orderBy: { numero: 'asc' }
    });
};

/**
 * Busca uma dimensão pelo número
 */
const findByNumero = (numero: number) => {
    return prisma.dimensoes.findUnique({
        where: { numero },
        include: { eixos: true }
    });
};

/**
 * Busca várias dimensões pelos números
 */
const findByNumeros = (numeros: number[]) => {
    return prisma.dimensoes.findMany({
        where: { numero: { in: numeros } }
    });
};

/**
 * Cria uma nova dimensão
 */
const create = (data: Prisma.DimensoesCreateInput) => {
    return prisma.dimensoes.create({ data });
};

/**
 * Atualiza uma dimensão
 */
const update = (numero: number, data: Prisma.DimensoesUpdateInput) => {
    return prisma.dimensoes.update({
        where: { numero },
        data
    });
};

/**
 * Remove uma dimensão
 */
const remove = (numero: number) => {
    return prisma.dimensoes.delete({
        where: { numero }
    });
};

/**
 * Busca dimensões por número do eixo
 */
const findByEixo = (numeroEixo: number) => {
    return prisma.dimensoes.findMany({
        where: { numero_eixos: numeroEixo },
        select: { numero: true, nome: true }
    });
};

export {
    findAll,
    findByNumero,
    findByNumeros,
    create,
    update,
    remove,
    findByEixo,
};
