import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todos os padrões de resposta (apenas ativos)
 */
const findAll = () => {
    return prisma.padrao_resposta.findMany({
        where: { ativo: true },
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
 * Retorna os status de todas as avaliações vinculadas a este padrão de resposta (via questões)
 */
const getUsage = async (id: number) => {
    const padrao = await prisma.padrao_resposta.findUnique({
        where: { id },
        include: {
            Questoes: {
                include: {
                    avaliacao_questoes: { include: { avaliacao: { select: { status: true } } } },
                    avaliacao: { select: { status: true } }
                }
            }
        }
    });

    if (!padrao) return [];

    const statuses = new Set<number>();
    padrao.Questoes.forEach(q => {
        q.avaliacao_questoes.forEach(aq => {
            if (aq.avaliacao?.status !== undefined && aq.avaliacao?.status !== null) {
                statuses.add(aq.avaliacao.status);
            }
        });
        q.avaliacao.forEach(a => {
            if (a.status !== undefined && a.status !== null) {
                statuses.add(a.status);
            }
        });
    });

    return Array.from(statuses);
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
const update = (id: number, data: any) => {
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
    return prisma.padrao_resposta.findFirst({ where: { sigla, ativo: true } });
};

/**
 * Cria um novo padrão de resposta com suas alternativas (Transacional)
 */
const createWithAlternativas = (sigla: string, alternativas: { descricao: string }[]) => {
    console.log('Sigla, alternativa: ', sigla, alternativas)
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
    getUsage,
    findBySigla,
    create,
    update,
    remove,
    createWithAlternativas,
};
