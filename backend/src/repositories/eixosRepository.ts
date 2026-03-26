import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todos os eixos
 */
const findAll = () => {
    return prisma.eixos.findMany({
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
 * Cria um novo eixo
 */
const create = (data: Prisma.EixosCreateInput) => {
    return prisma.eixos.create({ data });
};

/**
 * Atualiza um eixo
 */
const update = (numero: number, data: Prisma.EixosUpdateInput) => {
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
    create,
    update,
    remove,
    createWithDimensoes,
};
