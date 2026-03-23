import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as alternativas
 */
const findAll = () => {
    return prisma.alternativas.findMany({
        orderBy: { id: 'asc' }
    });
};

/**
 * Busca uma alternativa pelo ID
 */
const findById = (id: number) => {
    return prisma.alternativas.findUnique({
        where: { id }
    });
};

/**
 * Busca várias alternativas pelos IDs
 */
const findByIds = (ids: number[]) => {
    return prisma.alternativas.findMany({
        where: { id: { in: ids } }
    });
};

/**
 * Cria uma nova alternativa
 */
const create = (data: Prisma.AlternativasCreateInput) => {
    return prisma.alternativas.create({ data });
};

/**
 * Atualiza uma alternativa
 */
const update = (id: number, data: Prisma.AlternativasUpdateInput) => {
    return prisma.alternativas.update({
        where: { id },
        data
    });
};

/**
 * Remove uma alternativa
 */
const remove = (id: number) => {
    return prisma.alternativas.delete({
        where: { id }
    });
};

/**
 * Busca alternativas por ID do padrão de resposta
 */
const findByPadraoResposta = (idPadraoResp: number) => {
    return prisma.alternativas.findMany({
        where: { id_padrao_resp: idPadraoResp },
        orderBy: { id: 'asc' }
    });
};

export {
    findAll,
    findById,
    findByIds,
    create,
    update,
    remove,
    findByPadraoResposta,
};
