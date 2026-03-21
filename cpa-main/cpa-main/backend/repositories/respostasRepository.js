const prisma = require('./prismaClient');

// ─── Respostas Padrão ────────────────────────────────────────────────

/**
 * Verifica se um avaliador já respondeu uma avaliação
 * @param {string} avaliador_matricula
 * @param {number} idAvaliacao
 */
const findRespostaExistente = (avaliador_matricula, idAvaliacao) => {
    return prisma.respostas.findFirst({
        where: {
            avaliador_matricula,
            avaliacao_questao: { avaliacao: { id: idAvaliacao } },
        },
    });
};

/**
 * Busca a avaliação_questão com as questões adicionais
 * @param {number} id
 */
const findAvaliacaoQuestao = (id) => {
    return prisma.avaliacao_questoes.findUnique({
        where: { id },
        include: { questoes: { include: { questoes_adicionais: true } } },
    });
};

/**
 * Valida se uma alternativa pertence ao padrão de resposta da questão
 * @param {number} id
 */
const findAlternativa = (id) => {
    return prisma.alternativas.findUnique({ where: { id } });
};

/**
 * Cria uma resposta padrão
 * @param {object} data
 */
const createResposta = (data) => {
    return prisma.respostas.create({ data });
};

/**
 * Cria uma resposta de grade
 * @param {object} data
 */
const createRespostaGrade = (data) => {
    return prisma.respostasGrade.create({ data });
};

// ─── Relatório ───────────────────────────────────────────────────────

/**
 * Busca respostas padrão de uma avaliação com questões e dimensões
 * @param {number} idAvaliacao
 */
const findRespostasPorAvaliacao = (idAvaliacao) => {
    return prisma.respostas.findMany({
        where: { avaliacao_questao: { avaliacao: { id: idAvaliacao } } },
        include: {
            avaliacao_questao: {
                include: { questoes: { include: { dimensoes: true } } },
            },
        },
    });
};

/**
 * Busca respostas de grade de uma avaliação com questões adicionais
 * @param {number} idAvaliacao
 */
const findRespostasGradePorAvaliacao = (idAvaliacao) => {
    return prisma.respostasGrade.findMany({
        where: { avaliacao_questao: { avaliacao: { id: idAvaliacao } } },
        include: {
            avaliacao_questao: {
                include: {
                    questoes: { include: { dimensoes: true, questoes_adicionais: true } },
                },
            },
        },
    });
};

module.exports = {
    findRespostaExistente,
    findAvaliacaoQuestao,
    findAlternativa,
    createResposta,
    createRespostaGrade,
    findRespostasPorAvaliacao,
    findRespostasGradePorAvaliacao,
};
