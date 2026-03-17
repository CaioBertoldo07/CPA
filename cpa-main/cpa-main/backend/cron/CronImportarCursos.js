const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CronImportarCursos {

    /**
     * Executa a importação de cursos e modalidades a partir dos dados obtidos da API do Lyceum.
     * @param {Array} cursosLyceumJson - Array de objetos representando os cursos obtidos da API.
     */
    async execAsync(cursosLyceumJson) {
        for (const curso of cursosLyceumJson) {
            try {
                // Verifica se o curso já existe com base no identificador da API
                const existingCourse = await prisma.cursos.findUnique({
                    where: { identificador_api_lyceum: curso.CURSO },
                });

                if (existingCourse) {
                    // console.log(`Curso de código ${curso.CURSO} já existe na base! Pulando inserção...`);
                    continue;
                }

                // Insere ou atualiza a modalidade correspondente ao curso
                const modalidadeResult = await this.importModalidade(curso);
                if (modalidadeResult) {
                    console.log(`Modalidade ${curso.CURSO_TIPO} adicionada ou atualizada com sucesso!`);
                } else {
                    // console.warn(`Erro ao adicionar ou atualizar a modalidade ${curso.CURSO_TIPO}.`);
                }

                // Insere o curso no banco de dados
                const cursoResult = await this.importCurso(curso);
                if (cursoResult) {
                    console.log(`Curso ${curso.CURSO} adicionado à base de dados com sucesso!`);
                } else {
                    // console.warn(`Erro ao adicionar o curso ${curso.CURSO}.`);
                }

            } catch (error) {
                console.error(`Erro ao processar o curso ${curso.CURSO}:`, error);
            }
        }
    }

    /**
     * Insere ou atualiza uma modalidade no banco de dados com base no tipo de curso.
     * @param {Object} curso - Objeto do curso que contém o campo CURSO_TIPO.
     * @returns {Promise<Object>} Resultado da operação no banco.
     */
    async importModalidade(curso) {
        const modalidade = curso.CURSO_TIPO; // Ex: REGULAR, PARFOR

        if (!modalidade) {
            // console.warn(`Modalidade ausente para o curso ${curso.CURSO}.`);
            return null;
        }

        return prisma.modalidades.upsert({
            where: { mod_ensino: modalidade },
            create: {
                mod_ensino: modalidade,
                data_criacao: new Date(), // Adiciona data de criação para novas modalidades
                num_questoes: 0, // Exemplo de campo adicional
            },
            update: {}, // Nenhuma atualização necessária
        });
    }

    /**
     * Insere um curso no banco de dados, conectando as relações necessárias.
     * @param {Object} curso - Objeto do curso contendo informações para o banco.
     * @returns {Promise<Object>} Resultado da operação no banco.
     */
    async importCurso(curso) {
        const identificador_api_lyceum = curso.CURSO;
        const nome = curso.NOME;
        const municipio = curso.MUNICIPIO_NOME;
        const municipioUF = curso.MUNICIPIO_UF;
        const unidade = curso.NOME_COMP;
        const unidadeSigla = curso.NOME_ABREV;

        const nivel = curso.TIPO; // Ex: GRAD, LS
        const modalidade_api = curso.MODALIDADE; // Ex: BA (Bacharelado), TE (Tecnólogo)
        const modalidade = curso.CURSO_TIPO; // Ex: REGULAR, PARFOR

        if (!identificador_api_lyceum || !nome || !modalidade) {
            // console.warn(`Dados insuficientes para importar o curso ${curso.CURSO}.`);
            return null;
        }

        return prisma.cursos.upsert({
            where: { identificador_api_lyceum },
            create: {
                identificador_api_lyceum,
                nome,
                nivel,
                modalidade,
                modalidade_api,
                municipio: municipio ? {
                    connectOrCreate: {
                        where: { nome: municipio },
                        create: { nome: municipio, UF: municipioUF || "XX" },
                    },
                } : undefined,
                unidades: unidade ? {
                    connectOrCreate: {
                        where: { sigla: unidadeSigla },
                        create: { nome: unidade, sigla: unidadeSigla, municipio_vinculo: municipio },
                    },
                } : undefined,
            },
            update: {}, // Não atualizamos cursos existentes
        });
    }
}

module.exports = CronImportarCursos;
