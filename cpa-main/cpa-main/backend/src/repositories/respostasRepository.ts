import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

// ─── Respostas Padrão ────────────────────────────────────────────────

/**
 * Verifica se um avaliador já respondeu uma avaliação
 */
const findRespostaExistente = (avaliador_matricula: string, idAvaliacao: number) => {
    return prisma.respostas.findFirst({
        where: {
            avaliador_matricula,
            avaliacao_questao: { avaliacao: { id: idAvaliacao } },
        },
    });
};

/**
 * Busca a avaliação_questão com as questões adicionais
 */
const findAvaliacaoQuestao = (id: number) => {
    return prisma.avaliacao_questoes.findUnique({
        where: { id },
        include: { questoes: { include: { questoes_adicionais: true } } },
    });
};

/**
 * Valida se uma alternativa pertence ao padrão de resposta da questão
 */
const findAlternativa = (id: number) => {
    return prisma.alternativas.findUnique({ where: { id } });
};

/**
 * Cria uma resposta padrão
 */
const createResposta = (data: Prisma.RespostasCreateInput) => {
    return prisma.respostas.create({ data });
};

/**
 * Cria uma resposta de grade
 */
const createRespostaGrade = (data: Prisma.RespostasGradeCreateInput) => {
    return prisma.respostasGrade.create({ data });
};

// ─── Relatório ───────────────────────────────────────────────────────

/**
 * Busca respostas padrão de uma avaliação com questões e dimensões
 */
const findRespostasByAvaliacao = (idAvaliacao: number) => {
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
 */
const findRespostasGradeByAvaliacao = (idAvaliacao: number) => {
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

export {
    findRespostaExistente,
    findAvaliacaoQuestao,
    findAlternativa,
    createResposta,
    createRespostaGrade,
    findRespostasByAvaliacao,
    findRespostasGradeByAvaliacao,
};

