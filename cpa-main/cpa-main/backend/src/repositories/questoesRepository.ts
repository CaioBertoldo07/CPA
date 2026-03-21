import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as questões com relações completas
 */
const findMany = () => {
    return prisma.questoes.findMany({
        include: {
            dimensoes: { include: { eixos: true } },
            Questoes_categorias: { include: { categorias: true } },
            questoes_modalidades: { include: { modalidades: true } },
            tipo_questao: true,
            questoes_adicionais: true,
        },
        orderBy: { id: 'desc' },
    });
};

/**
 * Busca uma questão pelo ID com relações completas
 */
const findById = (id: number) => {
    return prisma.questoes.findUnique({
        where: { id },
        include: {
            Questoes_categorias: { include: { categorias: true } },
            questoes_modalidades: { include: { modalidades: true } },
            dimensoes: { include: { eixos: true } },
            tipo_questao: true,
            questoes_adicionais: true,
        },
    });
};

/**
 * Busca várias questões pelos IDs
 */
const findByIds = (ids: number[]) => {
    return prisma.questoes.findMany({
        where: { id: { in: ids } }
    });
};

/**
 * Cria uma nova questão com todas as relações
 */
const create = (data: Prisma.QuestoesCreateInput) => {
    return prisma.questoes.create({ data });
};

/**
 * Atualiza uma questão pelo ID
 */
const update = (id: number, data: Prisma.QuestoesUpdateInput) => {
    return prisma.questoes.update({ where: { id }, data });
};

/**
 * Remove uma questão pelo ID
 */
const remove = (id: number) => {
    return prisma.questoes.delete({ where: { id } });
};

/**
 * Busca uma questão diretamente pelo ID (sem relações, para checagem de existência)
 */
const findUniqueById = (id: number) => {
    return prisma.questoes.findUnique({ where: { id } });
};

export { findMany, findById, findByIds, create, update, remove, findUniqueById };
