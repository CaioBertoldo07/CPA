import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todos os padrões de resposta
 */
const findAll = () => {
    return prisma.padrao_resposta.findMany({
        include: { alternativas: true },
        orderBy: { id: 'asc' }
    });
};

/**
 * Busca um padrão de resposta pelo ID
 */
const findById = (id: number) => {
    return prisma.padrao_resposta.findUnique({
        where: { id },
        include: { alternativas: true }
    });
};

/**
 * Cria um novo padrão de resposta
 */
const create = (data: Prisma.Padrao_respostaCreateInput) => {
    return prisma.padrao_resposta.create({ data });
};

/**
 * Atualiza um padrão de resposta
 */
const update = (id: number, data: Prisma.Padrao_respostaUpdateInput) => {
    return prisma.padrao_resposta.update({
        where: { id },
        data
    });
};

/**
 * Remove um padrão de resposta
 */
const remove = (id: number) => {
    return prisma.padrao_resposta.delete({
        where: { id }
    });
};

/**
 * Busca um padrão de resposta pela sigla
 */
const findBySigla = (sigla: string) => {
    return prisma.padrao_resposta.findFirst({ where: { sigla } });
};

/**
 * Cria um novo padrão de resposta com suas alternativas (Transacional)
 */
const createWithAlternativas = (sigla: string, alternativas: { descricao: string }[]) => {
    return prisma.padrao_resposta.create({
        data: {
            sigla,
            alternativas: {
                create: alternativas
                    .filter(a => a.descricao && a.descricao.trim())
                    .map(a => ({
                        descricao: a.descricao
                    }))
            }
        },
        include: { alternativas: true }
    });
};

export {
    findAll,
    findById,
    findBySigla,
    create,
    update,
    remove,
    createWithAlternativas,
};
