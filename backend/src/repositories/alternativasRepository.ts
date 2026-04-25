import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as alternativas (ativas)
 */
const findAll = () => {
    return prisma.alternativas.findMany({
        where: { ativo: true },
        orderBy: { id: 'asc' }
    });
};

/**
 * Retorna os status de todas as avaliações vinculadas a esta alternativa (via respostas)
 */
const getUsage = async (id: number) => {
    const alternativa = await prisma.alternativas.findUnique({
        where: { id },
        include: {
            Respostas: {
                include: {
                    avaliacao_questoes: { include: { avaliacao: { select: { status: true } } } }
                }
            }
        }
    });

    if (!alternativa) return [];

    const statuses = new Set<number>();
    alternativa.Respostas.forEach(r => {
        if (r.avaliacao_questoes?.avaliacao?.status !== undefined) {
            statuses.add(r.avaliacao_questoes.avaliacao.status);
        }
    });

    return Array.from(statuses);
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
        where: { id: { in: ids }, ativo: true }
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
const update = (id: number, data: any) => {
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
        where: { id_padrao_resp: idPadraoResp, ativo: true },
        orderBy: { id: 'asc' }
    });
};

export {
    findAll,
    findById,
    findByIds,
    getUsage,
    create,
    update,
    remove,
    findByPadraoResposta,
};
