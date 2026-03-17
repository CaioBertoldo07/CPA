const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const https = require('https');



const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
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
            unidade, // Array de IDs de unidades
            cursos, // Array de IDs de cursos
            categorias, // Array de IDs de categorias
            modalidade, // Array de IDs de modalidades
            questoes, // Array de IDs de questões
            periodo_letivo,
            data_inicio,
            data_fim,
            status,
            ano,
        } = req.body;

        // Validação dos campos obrigatórios
        if (!unidade?.length || !cursos?.length || !categorias?.length || !modalidade?.length || !questoes?.length || !periodo_letivo || !data_inicio || !data_fim || !status || !ano) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        // Validação das Unidades (Múltiplas)
        const unidadesExistentes = await prisma.unidades.findMany({
            where: { id: { in: unidade } },
        });
        if (unidadesExistentes.length !== unidade.length) {
            return res.status(404).json({ error: 'Uma ou mais unidades não foram encontradas.' });
        }

        // Validação dos Cursos (Múltiplos)
        const cursosExistentes = await prisma.cursos.findMany({
            where: { identificador_api_lyceum: { in: cursos } },
        });
        if (cursosExistentes.length !== cursos.length) {
            return res.status(404).json({ error: 'Um ou mais cursos não foram encontrados.' });
        }

        // Validação das Categorias (Múltiplas)
        const categoriasExistentes = await prisma.categorias.findMany({
            where: { id: { in: categorias } },
        });
        if (categoriasExistentes.length !== categorias.length) {
            return res.status(404).json({ error: 'Uma ou mais categorias não foram encontradas.' });
        }

        // Validação das Modalidades (Múltiplas)
        const modalidadesExistentes = await prisma.modalidades.findMany({
            where: { id: { in: modalidade } },
        });
        if (modalidadesExistentes.length !== modalidade.length) {
            return res.status(404).json({ error: 'Uma ou mais modalidades não foram encontradas.' });
        }

        // Validação das Questões (Múltiplas)
        const questoesExistentes = await prisma.questoes.findMany({
            where: { id: { in: questoes } },
        });
        if (questoesExistentes.length !== questoes.length) {
            return res.status(404).json({ error: 'Uma ou mais questões não foram encontradas.' });
        }

        // Criando a Avaliação com Conexões Múltiplas
        const avaliacao = await prisma.avaliacao.create({
            data: {
                periodo_letivo,
                data_inicio: new Date(data_inicio),
                data_fim: new Date(data_fim),
                status,
                ano,
                unidade: { connect: unidade.map((id) => ({ id })) }, // Conectando múltiplas unidades
                modalidades: { connect: modalidade.map((id) => ({ id })) }, // Conectando múltiplas modalidades
                avaliacao_questoes: {
                    create: questoes.map((questaoId) => ({
                        questoes: { connect: { id: questaoId } },
                    })),
                },
                cursos: { connect: cursos.map((identificador_api_lyceum) => ({ identificador_api_lyceum })) }, // Conectando múltiplos cursos
                categorias: { connect: categorias.map((id) => ({ id })) }, // Conectando múltiplas categorias
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
        const { dataAtual } = req.query;
        const cursoUsuario = req.user.curso; // Obtém o curso do usuário do token

        if (!cursoUsuario) {
            return res.status(400).json({ error: 'Curso do usuário não encontrado no token.' });
        }

        // Busca as avaliações disponíveis para o curso do usuário
        const avaliacoes = await prisma.avaliacao.findMany({
            where: {
                cursos: {
                    some: {
                        identificador_api_lyceum: cursoUsuario, // Verifica o curso pelo identificador
                    },
                },
                data_inicio: { lte: dataAtual }, // Data início <= dataAtual
                data_fim: { gte: dataAtual },   // Data fim >= dataAtual
            },
            include: {
                questoes: true, // Inclui as questões associadas
            },
        });

        // Verifica se o usuário já respondeu a qualquer uma dessas avaliações
        const avaliacoesNaoRespondidas = [];
        const { matricula } = req.user;

        for (const avaliacao of avaliacoes) {
            const resposta = await prisma.respostas.findFirst({
                where: {
                    avaliacao_questao: {
                        avaliacao: { id: avaliacao.id },
                    },
                    avaliador_matricula: matricula,
                },
            });

            if (!resposta) {
                avaliacoesNaoRespondidas.push(avaliacao);
            }
        }

        if (avaliacoesNaoRespondidas.length === 0) {
            return res.status(404).json({ message: 'Nenhuma avaliação disponível para o curso do usuário.' });
        }

        res.status(200).json(avaliacoesNaoRespondidas);
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
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





module.exports = {
    createAvaliacao,
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    verificarSeUsuarioRespondeu,

};