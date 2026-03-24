import { Prisma } from '@prisma/client';
import prisma from './prismaClient';
import * as unidadesRepository from './unidadesRepository';
import * as cursosRepository from './cursosRepository';
import * as categoriasRepository from './categoriasRepository';
import * as modalidadesRepository from './modalidadesRepository';
import * as questoesRepository from './questoesRepository';

// ─── Criação e Leitura ───────────────────────────────────────────────

/**
 * Cria uma nova avaliação com todas as relações
 */
const create = (data: Prisma.AvaliacaoCreateInput) => {
    return prisma.avaliacao.create({ data });
};

/**
 * Busca todas as avaliações com relações completas
 */
const findMany = () => {
    return prisma.avaliacao.findMany({
        include: {
            avaliacao_questoes: {
                include: {
                    questoes: {
                        include: {
                            questoes_adicionais: true,
                            dimensoes: { include: { eixos: true } }
                        }
                    }
                }
            },
            unidade: true,
            categorias: true,
            cursos: true,
            modalidades: true,
        },
    });
};

/**
 * Busca uma avaliação pelo ID com relações completas
 */
const findById = (id: number) => {
    return prisma.avaliacao.findUnique({
        where: { id },
        include: {
            unidade: true,
            avaliacao_questoes: {
                include: {
                    questoes: {
                        include: {
                            dimensoes: { include: { eixos: true } },
                            padrao_resposta: { include: { alternativas: true } },
                            questoes_adicionais: true,
                        },
                    },
                },
            },
            categorias: true,
            cursos: true,
            modalidades: true,
        },
    });
};

/**
 * Busca uma avaliação simplificada pelo ID (sem relações profundas)
 */
const findByIdSimple = (id: number) => {
    return prisma.avaliacao.findUnique({
        where: { id },
        include: {
            unidade: true,
            cursos: true,
            categorias: true,
            modalidades: true,
            avaliacao_questoes: true,
        },
    });
};

/**
 * Busca avaliações disponíveis para o curso e data informados
 */
const findDisponiveis = (cursoIdentificador: string, dataAtual: Date) => {
    return prisma.avaliacao.findMany({
        where: {
            cursos: { some: { identificador_api_lyceum: cursoIdentificador } },
            data_inicio: { lte: dataAtual },
            data_fim: { gte: dataAtual },
        },
        include: {
            avaliacao_questoes: {
                include: {
                    questoes: {
                        include: {
                            dimensoes: { include: { eixos: true } }
                        }
                    }
                }
            }
        },
    });
};

// ─── Verificações ────────────────────────────────────────────────────

/**
 * Verifica se uma resposta do avaliador existe nessa avaliação
 */
const findRespostaDoAvaliador = (matricula: string, idAvaliacao: number) => {
    return prisma.respostas.findFirst({
        where: {
            avaliacao_questao: { avaliacao: { id: idAvaliacao } },
            avaliador_matricula: matricula,
        },
    });
};

/**
 * Busca as questões vinculadas à avaliação (para checar respostas antes de deletar)
 */
const findAvaliacaoQuestoes = (idAvaliacao: number) => {
    return prisma.avaliacao_questoes.findMany({
        where: { id_avaliacao: idAvaliacao },
        select: { id: true },
    });
};

/**
 * Verifica se existe alguma resposta padrão nos IDs de avaliacao_questoes
 */
const findRespostasExistentes = (ids: number[]) => {
    return prisma.respostas.findFirst({ where: { id_avaliacao_questoes: { in: ids } } });
};

/**
 * Verifica se existe alguma resposta de grade nos IDs de avaliacao_questoes
 */
const findRespostasGradeExistentes = (ids: number[]) => {
    return prisma.respostasGrade.findFirst({ where: { id_avaliacao_questoes: { in: ids } } });
};

// ─── Validações de entidades relacionadas ────────────────────────────

const validateUnidades = (ids: number[]) =>
    unidadesRepository.findByIds(ids);

const validateCursos = (identificadores: string[]) =>
    cursosRepository.findByIdentificadores(identificadores);

const validateCategorias = (ids: number[]) =>
    categoriasRepository.findByIds(ids);

const validateModalidades = (ids: number[]) =>
    modalidadesRepository.findByIds(ids);

const validateQuestoes = (ids: number[]) =>
    questoesRepository.findByIds(ids);

// ─── Atualização e Remoção ───────────────────────────────────────────

/**
 * Atualiza campos de uma avaliação
 */
const update = (id: number, data: Prisma.AvaliacaoUpdateInput) => {
    return prisma.avaliacao.update({ where: { id }, data });
};

/**
 * Encerra automaticamente avaliações enviadas com data_fim vencida
 */
const encerrarVencidas = () => {
    return prisma.avaliacao.updateMany({
        where: { status: 2, data_fim: { lt: new Date() } },
        data: { status: 3 },
    });
};

/**
 * Remove uma avaliação pelo ID
 */
const remove = (id: number) => {
    return prisma.avaliacao.delete({ where: { id } });
};

/**
 * Busca questão grade pelo ID (para uso no getAvaliacaoById de alunos)
 */
const findQuestaoGradeById = (id: number) => {
    return prisma.questoes.findUnique({
        where: { id },
        include: {
            padrao_resposta: { include: { alternativas: true } },
            dimensoes: { include: { eixos: true } },
            questoes_adicionais: true,
        },
    });
};

/**
 * Busca todas as avaliações já respondidas pelo avaliador em uma única query
 */
const findAvaliacoesRespondidasPeloAvaliador = (matricula: string, avaliacaoIds: number[]) => {
    return prisma.respostas.findMany({
        where: {
            avaliador_matricula: matricula,
            avaliacao_questao: { avaliacao: { id: { in: avaliacaoIds } } },
        },
        select: {
            id_avaliacao_questoes: true,
            avaliacao_questao: { select: { id_avaliacao: true } },
        },
        distinct: ['id_avaliacao_questoes'],
    });
};

/**
 * Busca uma questão de avaliação com detalhes (questões adicionais)
 */
const findAvaliacaoQuestaoWithDetails = (id: number) => {
    return prisma.avaliacao_questoes.findUnique({
        where: { id },
        include: {
            questoes: {
                include: {
                    questoes_adicionais: true
                }
            }
        }
    });
};

export {
    create,
    encerrarVencidas,
    findMany,
    findById,
    findByIdSimple,
    findDisponiveis,
    findRespostaDoAvaliador,
    findAvaliacaoQuestoes,
    findRespostasExistentes,
    findRespostasGradeExistentes,
    validateUnidades,
    validateCursos,
    validateCategorias,
    validateModalidades,
    validateQuestoes,
    update,
    remove,
    findQuestaoGradeById,
    findAvaliacaoQuestaoWithDetails,
    findAvaliacoesRespondidasPeloAvaliador,
};
