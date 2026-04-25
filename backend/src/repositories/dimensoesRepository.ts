import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as dimensões (apenas as ativas)
 */
const findAll = () => {
    return prisma.dimensoes.findMany({
        where: { ativo: true },
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
 * Retorna os status de todas as avaliações vinculadas a esta dimensão (via questões)
 */
const getUsage = async (numero: number) => {
    const dimensao = await prisma.dimensoes.findUnique({
        where: { numero },
        include: {
            questoes: {
                include: {
                    avaliacao_questoes: { include: { avaliacao: { select: { status: true } } } },
                    avaliacao: { select: { status: true } }
                }
            }
        }
    });

    if (!dimensao) return [];

    const statuses = new Set<number>();
    dimensao.questoes.forEach(q => {
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
 * Busca várias dimensões pelos números
 */
const findByNumeros = (numeros: number[]) => {
    return prisma.dimensoes.findMany({
        where: { numero: { in: numeros }, ativo: true }
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
const update = (numero: number, data: any) => {
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
        where: { numero_eixos: numeroEixo, ativo: true },
        select: { numero: true, nome: true }
    });
};

export {
    findAll,
    findByNumero,
    findByNumeros,
    getUsage,
    create,
    update,
    remove,
    findByEixo,
};
