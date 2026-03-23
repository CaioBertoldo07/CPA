import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as modalidades
 */
const findAll = () => {
    return prisma.modalidades
        .findMany({
            orderBy: { id: 'asc' },
            include: {
                Questoes_modalidades: {
                    select: { id_questoes: true },
                },
            },
        })
        .then((modalidades) =>
            modalidades.map((m: any) => {
                const ids = (m.Questoes_modalidades || [])
                    .map((qm: any) => qm.id_questoes)
                    .filter((id: any) => id !== null && id !== undefined);

                // Conta questões distintas vinculadas a essa modalidade
                const num_questoes = new Set(ids).size;

                const { Questoes_modalidades, ...rest } = m;
                return { ...rest, num_questoes };
            })
        );
};

/**
 * Busca uma modalidade pelo ID
 */
const findById = (id: number) => {
    return prisma.modalidades
        .findUnique({
            where: { id },
            include: {
                Questoes_modalidades: {
                    select: { id_questoes: true },
                },
            },
        })
        .then((m: any) => {
            if (!m) return m;
            const ids = (m.Questoes_modalidades || [])
                .map((qm: any) => qm.id_questoes)
                .filter((id: any) => id !== null && id !== undefined);

            const num_questoes = new Set(ids).size;
            const { Questoes_modalidades, ...rest } = m;
            return { ...rest, num_questoes };
        });
};

/**
 * Busca várias modalidades pelos IDs
 */
const findByIds = (ids: number[]) => {
    return prisma.modalidades.findMany({
        where: { id: { in: ids } }
    });
};

/**
 * Cria uma nova modalidade
 */
const create = (data: Prisma.ModalidadesCreateInput) => {
    return prisma.modalidades.create({ data });
};

/**
 * Atualiza uma modalidade
 */
const update = (id: number, data: Prisma.ModalidadesUpdateInput) => {
    return prisma.modalidades.update({
        where: { id },
        data
    });
};

/**
 * Remove uma modalidade
 */
const remove = (id: number) => {
    return prisma.modalidades.delete({
        where: { id }
    });
};

export {
    findAll,
    findById,
    findByIds,
    create,
    update,
    remove,
};
