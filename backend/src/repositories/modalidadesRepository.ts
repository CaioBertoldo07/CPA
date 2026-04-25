import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

/**
 * Busca todas as modalidades (apenas as ativas)
 */
const findAll = () => {
    return prisma.modalidades
        .findMany({
            where: { ativo: true },
            orderBy: { id: 'asc' },
            include: {
                Questoes_modalidades: {
                    select: { id_questoes: true },
                },
                cursos: {
                    select: { id: true },
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
                const num_cursos = (m.cursos || []).length;

                const { Questoes_modalidades, cursos, ...rest } = m;
                return { ...rest, num_questoes, num_cursos };
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
                cursos: {
                    select: { id: true },
                },
            },
        })
        .then((m: any) => {
            if (!m) return m;
            const ids = (m.Questoes_modalidades || [])
                .map((qm: any) => qm.id_questoes)
                .filter((id: any) => id !== null && id !== undefined);

            const num_questoes = new Set(ids).size;
            const num_cursos = (m.cursos || []).length;
            const { Questoes_modalidades, cursos, ...rest } = m;
            return { ...rest, num_questoes, num_cursos };
        });
};

/**
 * Verifica o uso da modalidade em avaliações
 */
const getUsage = async (id: number) => {
    const modalidade = await prisma.modalidades.findUnique({
        where: { id },
        include: {
            avaliacao: { select: { status: true } }
        }
    });

    if (!modalidade) return [];
    return modalidade.avaliacao.map(a => a.status);
};

/**
 * Busca várias modalidades pelos IDs
 */
const findByIds = (ids: number[]) => {
    return prisma.modalidades.findMany({
        where: { id: { in: ids }, ativo: true }
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
const update = (id: number, data: any) => {
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
    getUsage,
    create,
    update,
    remove,
};
