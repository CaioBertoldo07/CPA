import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todos os eixos (apenas ativos)
 */
const findAll = () => {
    return prisma.eixos.findMany({
        where: { ativo: true },
        orderBy: { numero: 'asc' }
    });
};

/**
 * Busca um eixo pelo número
 */
const findByNumero = (numero: number) => {
    return prisma.eixos.findUnique({
        where: { numero }
    });
};

/**
 * Retorna os status de todas as avaliações vinculadas a este eixo (via dimensões e questões)
 */
const getUsage = async (numero: number) => {
    const eixo = await prisma.eixos.findUnique({
        where: { numero },
        include: {
            dimensoes: {
                include: {
                    questoes: {
                        include: {
                            avaliacao_questoes: { include: { avaliacao: { select: { status: true } } } },
                            avaliacao: { select: { status: true } }
                        }
                    }
                }
            }
        }
    });

    if (!eixo) return [];

    const statuses = new Set<number>();
    eixo.dimensoes.forEach(d => {
        d.questoes.forEach(q => {
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
    });

    return Array.from(statuses);
};

/**
 * Cria um novo eixo
 */
const create = (data: Prisma.EixosCreateInput) => {
    return prisma.eixos.create({ data });
};

/**
 * Atualiza um eixo
 */
const update = (numero: number, data: any) => {
    return prisma.eixos.update({
        where: { numero },
        data
    });
};

/**
 * Remove um eixo e suas dimensões (tratado via delete cascade ou manualmente se necessário)
 * Nota: No schema Prisma, se houver onDelete: Cascade, o prisma cuida.
 * Caso contrário, o repositório deve tratar.
 */
const remove = (numero: number) => {
    return prisma.eixos.delete({
        where: { numero }
    });
};

/**
 * Cria um novo eixo com suas dimensões (Transacional)
 */
const createWithDimensoes = (numero: number, nome: string, dimensoes: { numero: number, nome: string }[]) => {
    return prisma.eixos.create({
        data: {
            numero,
            nome,
            dimensoes: {
                create: dimensoes.map(d => ({
                    numero: d.numero,
                    nome: d.nome,
                    data_criacao: new Date()
                }))
            }
        },
        include: { dimensoes: true }
    });
};

export {
    findAll,
    findByNumero,
    getUsage,
    create,
    update,
    remove,
    createWithDimensoes,
};
