const prisma = require('./prismaClient');

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
 * @param {number} id
 */
const findById = (id) => {
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
 * Cria uma nova questão com todas as relações
 * @param {object} data
 */
const create = (data) => {
    return prisma.questoes.create({ data });
};

/**
 * Atualiza uma questão pelo ID
 * @param {number} id
 * @param {object} data
 */
const update = (id, data) => {
    return prisma.questoes.update({ where: { id }, data });
};

/**
 * Remove uma questão pelo ID
 * @param {number} id
 */
const remove = (id) => {
    return prisma.questoes.delete({ where: { id } });
};

/**
 * Busca uma questão diretamente pelo ID (sem relações, para checagem de existência)
 * @param {number} id
 */
const findUniqueById = (id) => {
    return prisma.questoes.findUnique({ where: { id } });
};

module.exports = { findMany, findById, create, update, remove, findUniqueById };
