import { PrismaClient } from '@prisma/client';
import { LyceumCursoDTO } from '../dtos/LyceumDTO';
const prisma = new PrismaClient();

class CronImportarCursos {

    /**
     * Executa a importação de cursos e modalidades a partir dos dados obtidos da API do Lyceum.
     * @param {LyceumCursoDTO[]} cursosLyceumJson - Array de objetos representando os cursos obtidos da API.
     */
    async execAsync(cursosLyceumJson: LyceumCursoDTO[]) {
        for (const curso of cursosLyceumJson) {
            try {
                // Verifica se o curso já existe com base no identificador da API
                const existingCourse = await prisma.cursos.findUnique({
                    where: { identificador_api_lyceum: curso.CURSO },
                });

                if (existingCourse) {
                    continue;
                }

                // Insere o curso no banco de dados
                const cursoResult = await this.importCurso(curso);
                if (cursoResult) {
                    console.log(`Curso ${curso.CURSO} adicionado à base de dados com sucesso!`);
                }

            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Erro ao processar o curso ${curso.CURSO}:`, errorMessage);
            }
        }
    }

    /**
     * Insere ou atualiza uma modalidade no banco de dados com base no tipo de curso.
     */
    async importModalidade(curso: LyceumCursoDTO) {
        const modalidade = curso.CURSO_TIPO; // Ex: REGULAR, PARFOR

        if (!modalidade) {
            return null;
        }

        return prisma.modalidades.upsert({
            where: { mod_ensino: modalidade },
            create: {
                mod_ensino: modalidade,
                data_criacao: new Date(),
                num_questoes: 0,
            },
            update: {},
        });
    }

    /**
     * Insere um curso no banco de dados, conectando as relações necessárias.
     */
    async importCurso(curso: LyceumCursoDTO) {
        const identificador_api_lyceum = curso.CURSO;
        const nome = curso.NOME;
        const municipioNome = curso.MUNICIPIO_NOME || 'DESCONHECIDO';
        const municipioUF = curso.MUNICIPIO_UF || 'XX';
        const unidade = curso.NOME_COMP;
        const unidadeSigla = curso.NOME_ABREV;

        const nivel = curso.TIPO; // Ex: GRAD, LS
        const modalidade_api = curso.MODALIDADE; // Ex: BA (Bacharelado), TE (Tecnólogo)
        const modalidade = curso.CURSO_TIPO; // Ex: REGULAR, PARFOR

        if (!identificador_api_lyceum || !nome || !modalidade) {
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
                curso_tipo: modalidade,
                ativo: true,
                municipio: {
                    connectOrCreate: {
                        where: { nome: municipioNome },
                        create: { nome: municipioNome, UF: municipioUF }
                    }
                },
                unidades: unidade ? {
                    connectOrCreate: {
                        where: { sigla: unidadeSigla },
                        create: {
                            nome: unidade,
                            sigla: unidadeSigla,
                            municipio_vinculo: municipioNome
                        }
                    }
                } : undefined,
            },
            update: {
                curso_tipo: modalidade,
            },
        });
    }
}

export { CronImportarCursos };
