const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const https = require('https');



const httpsAgent = new https.Agent({
    rejectUnauthorized:
        process.env.NODE_ENV === 'production' && process.env.DISABLE_SSL_VALIDATION !== 'true',
});

const getDisciplinasAluno = async (ano, semestre, universityToken) => {
    try {
        const url = `https://api.uea.edu.br/lyceum/cadu/aluno/historico/matriculapessoal/ano/${ano}/semestre/${semestre}`;
        console.log('Requisitando disciplinas com URL:', url);
        console.log('Token usado:', universityToken);

        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${universityToken}`
            },
            httpsAgent,
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Erro ao buscar disciplinas:', error.response.status, error.response.data);
        } else {
            console.error('Erro ao buscar disciplinas:', error.message);
        }
        return { error: 'Erro ao buscar disciplinas.' };
    }
};
 
// Função para criar uma avaliação
async function createAvaliacao(req, res) {
    try {
        console.log('Dados recebidos na requisição:', req.body);

        const {
            unidade,
            cursos,
            categorias,
            modalidade,
            questoes,
            periodo_letivo,
            data_inicio,
            data_fim,
            status,
            ano,
        } = req.body;

        // CORRIGIDO: validação detalhada com mensagens específicas por campo
        const erros = [];

        if (!ano) erros.push('Ano é obrigatório.');
        if (!periodo_letivo) erros.push('Período letivo é obrigatório.');
        if (!data_inicio) erros.push('Data de início é obrigatória.');
        if (!data_fim) erros.push('Data de encerramento é obrigatória.');
        if (!unidade?.length) erros.push('Pelo menos uma unidade deve ser selecionada.');
        if (!cursos?.length) erros.push('Pelo menos um curso deve ser selecionado.');
        if (!categorias?.length) erros.push('Pelo menos uma categoria deve ser selecionada.');
        if (!modalidade?.length) erros.push('Pelo menos uma modalidade deve ser selecionada.');
        if (!questoes?.length) erros.push('Pelo menos uma questão deve ser selecionada.');

        if (data_inicio && data_fim && new Date(data_fim) <= new Date(data_inicio)) {
            erros.push('A data de encerramento deve ser posterior à data de início.');
        }

        if (erros.length > 0) {
            return res.status(400).json({ error: erros.join(' ') });
        }

        // Validação das entidades no banco (mantida do código original)
        const unidadesExistentes = await prisma.unidades.findMany({
            where: { id: { in: unidade } },
        });
        if (unidadesExistentes.length !== unidade.length) {
            return res.status(404).json({ error: 'Uma ou mais unidades não foram encontradas.' });
        }

        const cursosExistentes = await prisma.cursos.findMany({
            where: { identificador_api_lyceum: { in: cursos } },
        });
        if (cursosExistentes.length !== cursos.length) {
            return res.status(404).json({ error: 'Um ou mais cursos não foram encontrados.' });
        }

        const categoriasExistentes = await prisma.categorias.findMany({
            where: { id: { in: categorias } },
        });
        if (categoriasExistentes.length !== categorias.length) {
            return res.status(404).json({ error: 'Uma ou mais categorias não foram encontradas.' });
        }

        const modalidadesExistentes = await prisma.modalidades.findMany({
            where: { id: { in: modalidade } },
        });
        if (modalidadesExistentes.length !== modalidade.length) {
            return res.status(404).json({ error: 'Uma ou mais modalidades não foram encontradas.' });
        }

        const questoesExistentes = await prisma.questoes.findMany({
            where: { id: { in: questoes } },
        });
        if (questoesExistentes.length !== questoes.length) {
            return res.status(404).json({ error: 'Uma ou mais questões não foram encontradas.' });
        }

        const avaliacao = await prisma.avaliacao.create({
            data: {
                periodo_letivo,
                data_inicio: new Date(data_inicio),
                data_fim: new Date(data_fim),
                status,
                ano,
                unidade: { connect: unidade.map((id) => ({ id })) },
                modalidades: { connect: modalidade.map((id) => ({ id })) },
                avaliacao_questoes: {
                    create: questoes.map((questaoId) => ({
                        questoes: { connect: { id: questaoId } },
                    })),
                },
                cursos: { connect: cursos.map((identificador_api_lyceum) => ({ identificador_api_lyceum })) },
                categorias: { connect: categorias.map((id) => ({ id })) },
            },
        });

        return res.status(201).json({ message: 'Avaliação criada com sucesso!', avaliacao });
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}


// Função para obter todas as avaliações
const getAvaliacoes = async (req, res) => {
    try {
        const avaliacoes = await prisma.avaliacao.findMany({
            include: {
                questoes: {
                    include: {
                        questoes_adicionais: true, // Incluir as questões adicionais para cada questão
                    },
                },
                unidade: true,
                categorias: true,
                cursos: true,
                modalidades: true,
            },
        });
        res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
};


// Função para obter as avaliações disponíveis
const getAvaliacoesDisponiveis = async (req, res) => {
    try {
        const agora = new Date();

        const cursoBruto = req.user?.curso;
        const matricula = req.user?.matricula;

        if (!cursoBruto || !matricula) {
            return res.status(400).json({
                error: 'Dados do usuário incompletos no token.',
            });
        }

        const cursos = Array.isArray(cursoBruto)
            ? cursoBruto.map(c => String(c).trim()).filter(Boolean)
            : [String(cursoBruto).trim()].filter(Boolean);

        const isDev = cursos.includes('CURSO_TESTE');

        const avaliacoes = await prisma.avaliacao.findMany({
            where: {
                status: 2,
                ...(isDev ? {} : {
                    cursos: {
                        some: {
                            identificador_api_lyceum: {
                                in: cursos,
                            },
                        },
                    },
                }),
                data_inicio: { lte: agora },
                data_fim: { gte: agora },
            },
            include: {
                questoes: true,
            },
        });

        // 🔥 Busca respostas de uma vez (performance)
        const respostas = await prisma.respostas.findMany({
            where: {
                avaliador_matricula: matricula,
                avaliacao_questao: {
                    avaliacao: {
                        id: { in: avaliacoes.map(a => a.id) }
                    }
                }
            },
            select: {
                avaliacao_questao: {
                    select: {
                        avaliacao: {
                            select: { id: true }
                        }
                    }
                }
            }
        });

        const respondidasIds = new Set(
            respostas.map(r => r.avaliacao_questao.avaliacao.id)
        );

        const avaliacoesNaoRespondidas = avaliacoes.filter(
            a => !respondidasIds.has(a.id)
        );

        return res.status(200).json(avaliacoesNaoRespondidas);

    } catch (error) {
        console.error('Erro ao buscar avaliações disponíveis:', error);
        return res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
};


const getAvaliacaoById = async (req, res) => {
    try {
        const { id } = req.params;
        const intId = parseInt(id, 10);

        if (isNaN(intId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Busca a avaliação base
        const avaliacao = await prisma.avaliacao.findUnique({
            where: { id: intId },
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

        if (!avaliacao) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        // Apenas para alunos
        if (req.user.oberonPerfilNome === 'DISCENTE') {
            const [anoAvaliacao, semestreAvaliacao] = avaliacao.periodo_letivo.split('.');

            // Busca disciplinas do aluno
            const disciplinas = await getDisciplinasAluno(
                anoAvaliacao,
                semestreAvaliacao,
                req.user.universityToken
            );

            if (disciplinas.message?.length > 0) {
                try {
                    // Remove a questão 18 original da lista
                    avaliacao.avaliacao_questoes = avaliacao.avaliacao_questoes.filter(
                        aq => aq.questoes.id !== 18
                    );

                    // Busca a questão grade fixa (ID 18) com subquestões originais
                    const gradeQuestao = await prisma.questoes.findUnique({
                        where: { id: 18 },
                        include: {
                            padrao_resposta: { include: { alternativas: true } },
                            dimensoes: { include: { eixos: true } },
                            questoes_adicionais: true,
                        },
                    });

                    if (gradeQuestao) {
                        for (const disciplina of disciplinas.message) {
                            // Valida campos obrigatórios
                            if (!disciplina.DISC_DISCIPLINA || !disciplina.DISC_NOME) {
                                console.warn('Disciplina inválida:', disciplina);
                                continue;
                            }

                            // Clona a questão grade para não alterar a original
                            const questaoClone = JSON.parse(JSON.stringify(gradeQuestao));

                            // Adiciona a disciplina como nova subquestão
                            questaoClone.questoes_adicionais.push({
                                id: `DISC_${disciplina.DISC_DISCIPLINA}`,
                                descricao: `${disciplina.DISC_DISCIPLINA} - ${disciplina.DISC_NOME}`,
                                questao_id: 18,
                            });

                            // Adiciona à avaliação
                            avaliacao.avaliacao_questoes.push({
                                id: `DISC_${disciplina.DISC_DISCIPLINA}_QUESTAO`,
                                descricao: `${disciplina.DISC_DISCIPLINA} - ${disciplina.DISC_NOME}`,
                                questoes: questaoClone,
                            });
                        }
                    }
                } catch (error) {
                    console.error('Erro ao processar questão grade:', error);
                }
            }
        }

        return res.json(avaliacao);
    } catch (error) {
        console.error('Erro ao buscar avaliação:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};


// AvaliacoesController.js
const verificarSeUsuarioRespondeu = async (req, res) => {
    try {
        const { idAvaliacao } = req.params; // ID da avaliação vindo da URL
        const { matricula } = req.user; // Matricula do usuário logado (middleware de autenticação)

        // Verifica se o usuário já respondeu a alguma questão dessa avaliação
        const resposta = await prisma.respostas.findFirst({
            where: {
                avaliacao_questao: {
                    avaliacao: {
                        id: parseInt(idAvaliacao),
                    },
                },
                avaliador_matricula: matricula,
            },
        });

        // Resposta estruturada com o campo "jaRespondeu"
        if (resposta) {
            return res.status(200).json({ jaRespondeu: true });
        }

        res.status(200).json({ jaRespondeu: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao verificar avaliação.', error: error.message });
    }
};

// ADICIONADO: função para enviar avaliação (muda status de rascunho para enviada)
const enviarAvaliacao = async (req, res) => {
    try {
        const { id } = req.params;
        const intId = parseInt(id, 10);

        // Busca avaliação com todas as relações necessárias para validar completude
        const avaliacao = await prisma.avaliacao.findUnique({
            where: { id: intId },
            include: {
                unidade: true,
                cursos: true,
                categorias: true,
                modalidades: true,
                avaliacao_questoes: true,
            }
        });

        if (!avaliacao) {
            return res.status(404).json({ error: 'Avaliação não encontrada.' });
        }

        // REGRA: apenas rascunhos podem ser enviados
        if (avaliacao.status !== 1) {
            return res.status(400).json({
                error: 'Apenas avaliações em rascunho podem ser enviadas.'
            });
        }

        // ADICIONADO: validação de completude antes de permitir envio
        const erros = [];

        if (!avaliacao.ano) erros.push('Ano não informado.');
        if (!avaliacao.periodo_letivo) erros.push('Período letivo não informado.');
        if (!avaliacao.data_inicio) erros.push('Data de início não informada.');
        if (!avaliacao.data_fim) erros.push('Data de encerramento não informada.');
        if (!avaliacao.unidade?.length) erros.push('Nenhuma unidade vinculada.');
        if (!avaliacao.cursos?.length) erros.push('Nenhum curso vinculado.');
        if (!avaliacao.categorias?.length) erros.push('Nenhuma categoria vinculada.');
        if (!avaliacao.modalidades?.length) erros.push('Nenhuma modalidade vinculada.');
        if (!avaliacao.avaliacao_questoes?.length) erros.push('Nenhuma questão vinculada.');

        // ADICIONADO: data de fim deve ser posterior à data de início
        if (avaliacao.data_inicio && avaliacao.data_fim) {
            if (new Date(avaliacao.data_fim) <= new Date(avaliacao.data_inicio)) {
                erros.push('A data de encerramento deve ser posterior à data de início.');
            }
        }

        if (erros.length > 0) {
            return res.status(400).json({
                error: 'Avaliação incompleta. Corrija os problemas antes de enviar.',
                detalhes: erros
            });
        }

        const avaliacaoAtualizada = await prisma.avaliacao.update({
            where: { id: intId },
            data: { status: 2 }
        });

        return res.status(200).json({
            message: 'Avaliação enviada com sucesso.',
            avaliacao: avaliacaoAtualizada
        });
    } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// ADICIONADO: função para prorrogar avaliação
const prorrogarAvaliacao = async (req, res) => {
    try {
        const { id } = req.params;
        const { data_fim } = req.body;
        const intId = parseInt(id, 10);

        // Valida se a nova data foi fornecida
        if (!data_fim) {
            return res.status(400).json({ error: 'Nova data de encerramento é obrigatória.' });
        }

        const avaliacao = await prisma.avaliacao.findUnique({
            where: { id: intId }
        });

        if (!avaliacao) {
            return res.status(404).json({ error: 'Avaliação não encontrada.' });
        }

        // REGRA: apenas avaliações enviadas (status 2) podem ser prorrogadas
        if (avaliacao.status !== 2) {
            return res.status(400).json({
                error: 'Apenas avaliações enviadas podem ser prorrogadas.'
            });
        }

        // REGRA: avaliações encerradas (prazo já vencido) não podem ser prorrogadas
        const agora = new Date();
        if (new Date(avaliacao.data_fim) < agora) {
            return res.status(400).json({
                error: 'Avaliações encerradas não podem ser prorrogadas.'
            });
        }

        // REGRA: nova data deve ser posterior à data atual
        const novaDataFim = new Date(data_fim);
        if (novaDataFim <= agora) {
            return res.status(400).json({
                error: 'A nova data de encerramento deve ser uma data futura.'
            });
        }

        // REGRA: nova data deve ser posterior à data de encerramento atual
        if (novaDataFim <= new Date(avaliacao.data_fim)) {
            return res.status(400).json({
                error: 'A nova data de encerramento deve ser posterior à data atual de encerramento.'
            });
        }

        const avaliacaoAtualizada = await prisma.avaliacao.update({
            where: { id: intId },
            data: { data_fim: novaDataFim }
        });

        return res.status(200).json({
            message: 'Avaliação prorrogada com sucesso.',
            avaliacao: avaliacaoAtualizada
        });
    } catch (error) {
        console.error('Erro ao prorrogar avaliação:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// ADICIONADO: função para deletar avaliação com validação de status
const deleteAvaliacao = async (req, res) => {
    try {
        const { id } = req.params;
        const intId = parseInt(id, 10);

        const avaliacao = await prisma.avaliacao.findUnique({
            where: { id: intId }
        });

        if (!avaliacao) {
            return res.status(404).json({ error: 'Avaliação não encontrada.' });
        }

        // REGRA: avaliações enviadas ou encerradas não podem ser excluídas
        if (avaliacao.status === 2 || avaliacao.status === 3) {
            return res.status(400).json({
                error: 'Avaliações enviadas ou encerradas não podem ser excluídas.'
            });
        }

        // ADICIONADO: verificar se existem respostas vinculadas às questões desta avaliação
        const avaliacaoQuestoes = await prisma.avaliacao_questoes.findMany({
            where: { id_avaliacao: intId },
            select: { id: true }
        });

        const idsQuestoes = avaliacaoQuestoes.map(aq => aq.id);

        if (idsQuestoes.length > 0) {
            // Verifica respostas padrão
            const respostasExistentes = await prisma.respostas.findFirst({
                where: {
                    id_avaliacao_questoes: { in: idsQuestoes }
                }
            });

            // Verifica respostas de grade
            const respostasGradeExistentes = await prisma.respostasGrade.findFirst({
                where: {
                    id_avaliacao_questoes: { in: idsQuestoes }
                }
            });

            if (respostasExistentes || respostasGradeExistentes) {
                return res.status(400).json({
                    error: 'Esta avaliação já possui respostas registradas e não pode ser excluída.'
                });
            }
        }

        await prisma.avaliacao.delete({
            where: { id: intId }
        });

        return res.status(200).json({ message: 'Avaliação excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar avaliação:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = {
    createAvaliacao,
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    verificarSeUsuarioRespondeu,
    enviarAvaliacao,       // ADICIONADO
    prorrogarAvaliacao,    // ADICIONADO
    deleteAvaliacao,    // ADICIONADO
};