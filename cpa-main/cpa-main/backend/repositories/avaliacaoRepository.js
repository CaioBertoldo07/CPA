const prisma = require('./prismaClient');

// ─── Criação e Leitura ───────────────────────────────────────────────

/**
 * Cria uma nova avaliação com todas as relações
 * @param {object} data
 */
const create = (data) => {
    return prisma.avaliacao.create({ data });
};

/**
 * Busca todas as avaliações com relações completas
 */
const findMany = () => {
    return prisma.avaliacao.findMany({
        include: {
            questoes: { include: { questoes_adicionais: true } },
            unidade: true,
            categorias: true,
            cursos: true,
            modalidades: true,
        },
    });
};

/**
 * Busca uma avaliação pelo ID com relações completas
 * @param {number} id
 */
const findById = (id) => {
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
 * @param {number} id
 */
const findByIdSimple = (id) => {
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
 * @param {string} cursoIdentificador
 * @param {string} dataAtual
 */
const findDisponiveis = (cursoIdentificador, dataAtual) => {
    return prisma.avaliacao.findMany({
        where: {
            cursos: { some: { identificador_api_lyceum: cursoIdentificador } },
            data_inicio: { lte: dataAtual },
            data_fim: { gte: dataAtual },
        },
        include: { questoes: true },
    });
};

// ─── Verificações ────────────────────────────────────────────────────

/**
 * Verifica se uma resposta do avaliador existe nessa avaliação
 * @param {string} matricula
 * @param {number} idAvaliacao
 */
const findRespostaDoAvaliador = (matricula, idAvaliacao) => {
    return prisma.respostas.findFirst({
        where: {
            avaliacao_questao: { avaliacao: { id: idAvaliacao } },
            avaliador_matricula: matricula,
        },
    });
};

/**
 * Busca as questões vinculadas à avaliação (para checar respostas antes de deletar)
 * @param {number} idAvaliacao
 */
const findAvaliacaoQuestoes = (idAvaliacao) => {
    return prisma.avaliacao_questoes.findMany({
        where: { id_avaliacao: idAvaliacao },
        select: { id: true },
    });
};

/**
 * Verifica se existe alguma resposta padrão nos IDs de avaliacao_questoes
 * @param {number[]} ids
 */
const findRespostasExistentes = (ids) => {
    return prisma.respostas.findFirst({ where: { id_avaliacao_questoes: { in: ids } } });
};

/**
 * Verifica se existe alguma resposta de grade nos IDs de avaliacao_questoes
 * @param {number[]} ids
 */
const findRespostasGradeExistentes = (ids) => {
    return prisma.respostasGrade.findFirst({ where: { id_avaliacao_questoes: { in: ids } } });
};

// ─── Validações de entidades relacionadas ────────────────────────────

const validateUnidades = (ids) =>
    prisma.unidades.findMany({ where: { id: { in: ids } } });

const validateCursos = (identificadores) =>
    prisma.cursos.findMany({ where: { identificador_api_lyceum: { in: identificadores } } });

const validateCategorias = (ids) =>
    prisma.categorias.findMany({ where: { id: { in: ids } } });

const validateModalidades = (ids) =>
    prisma.modalidades.findMany({ where: { id: { in: ids } } });

const validateQuestoes = (ids) =>
    prisma.questoes.findMany({ where: { id: { in: ids } } });

// ─── Atualização e Remoção ───────────────────────────────────────────

/**
 * Atualiza campos de uma avaliação
 * @param {number} id
 * @param {object} data
 */
const update = (id, data) => {
    return prisma.avaliacao.update({ where: { id }, data });
};

/**
 * Remove uma avaliação pelo ID
 * @param {number} id
 */
const remove = (id) => {
    return prisma.avaliacao.delete({ where: { id } });
};

/**
 * Busca questão grade pelo ID (para uso no getAvaliacaoById de alunos)
 * @param {number} id
 */
const findQuestaoGradeById = (id) => {
    return prisma.questoes.findUnique({
        where: { id },
        include: {
            padrao_resposta: { include: { alternativas: true } },
            dimensoes: { include: { eixos: true } },
            questoes_adicionais: true,
        },
    });
};

module.exports = {
    create,
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
};
