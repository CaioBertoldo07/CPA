const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const salvarRespostas = async (req, res) => {
    console.log("Recebida requisição para salvar respostas:", req.body);

    const { idAvaliacao, respostas } = req.body;
    if (!idAvaliacao || !respostas || respostas.length === 0) {
        console.error("Erro: Dados obrigatórios ausentes");
        return res.status(400).json({ error: 'Faltam dados obrigatórios: idAvaliacao ou respostas.' });
    }

    const avaliador_matricula = req.user.matricula;
    console.log("Avaliador matricula:", avaliador_matricula);

    try {
        console.log("Verificando se o avaliador já respondeu a esta avaliação...");
        const respostaExistente = await prisma.respostas.findFirst({
            where: {
                avaliador_matricula,
                avaliacao_questao: {
                    avaliacao: { id: idAvaliacao },
                },
            },
        });

        if (respostaExistente) {
            console.warn("Avaliador já respondeu essa avaliação.");
            return res.status(400).json({ error: 'Você já respondeu a esta avaliação.' });
        }

        console.log("Agrupando respostas por questão...");
        const respostasAgrupadas = respostas.reduce((acc, resposta) => {
            const key = resposta.id_avaliacao_questoes;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(resposta);
            return acc;
        }, {});

        console.log("Respostas agrupadas:", respostasAgrupadas);

        const registrosSalvos = [];

        for (const idQuestaoStr of Object.keys(respostasAgrupadas)) {
            const idQuestao = parseInt(idQuestaoStr, 10);
            const grupoRespostas = respostasAgrupadas[idQuestao];

            console.log(`Buscando questão ID ${idQuestao} no banco...`);
            const avaliacaoQuestao = await prisma.avaliacao_questoes.findUnique({
                where: { id: idQuestao },
                include: {
                    questoes: {
                        include: {
                            questoes_adicionais: true,
                        },
                    },
                },
            });

            if (!avaliacaoQuestao) {
                console.error(`Erro: Questão ID ${idQuestao} não encontrada.`);
                return res.status(404).json({ error: `Questão não encontrada para ID ${idQuestao}` });
            }

            const questao = avaliacaoQuestao.questoes;
            console.log(`Questão ${idQuestao} encontrada. Tipo: ${questao.questao_tipo}`);

            const data_resposta = new Date();

            if (questao.id_questoes_tipo === 2) {
                console.log(`Questão ${idQuestao} é do tipo grade.`);
                const qtdSubitens = questao.questoes_adicionais.length;
                console.log(`A questão grade espera ${qtdSubitens} respostas, recebidas ${grupoRespostas.length}.`);

                if (grupoRespostas.length !== qtdSubitens) {
                    console.error(`Erro: Número incorreto de respostas para questão grade ${idQuestao}`);
                    return res.status(400).json({
                        error: `Para a questão ${idQuestao} (grade) espera-se ${qtdSubitens} respostas, mas foram recebidas ${grupoRespostas.length}.`,
                    });
                }

                for (const subResposta of grupoRespostas) {
                    console.log(`Validando alternativa ${subResposta.id_alternativa} para subitem ${subResposta.adicionalId}`);
                    const alternativa = await prisma.alternativas.findUnique({
                        where: { id: subResposta.id_alternativa },
                    });

                    if (!alternativa || alternativa.id_padrao_resp !== questao.id_padrao_resposta) {
                        console.error(`Erro: Alternativa inválida (${subResposta.id_alternativa}) para questão ${questao.id}.`);
                        return res.status(400).json({
                            error: `Alternativa ${subResposta.id_alternativa} inválida para a questão ${questao.id}.`,
                        });
                    }

                    console.log(`Salvando resposta grade para questão ${idQuestao}, subitem ${subResposta.adicionalId}...`);
                    const respostaGradeCriada = await prisma.respostasGrade.create({
                        data: {
                            id_avaliacao_questoes: idQuestao,
                            adicionalId: subResposta.adicionalId,
                            resposta: alternativa.descricao,
                            data_resposta,
                            avaliador_matricula,
                        },
                    });
                    registrosSalvos.push(respostaGradeCriada);
                    console.log(`Resposta grade salva com sucesso para questão ${idQuestao}, subitem ${subResposta.adicionalId}.`);
                }
            } else {
                console.log(`Questão ${idQuestao} é do tipo padrão.`);
                if (grupoRespostas.length !== 1) {
                    console.error(`Erro: Esperava 1 resposta para questão ${idQuestao}, mas recebeu ${grupoRespostas.length}.`);
                    return res.status(400).json({
                        error: `Para a questão ${idQuestao} espera-se 1 resposta, mas foram recebidas ${grupoRespostas.length}.`,
                    });
                }

                const { id_alternativa } = grupoRespostas[0];
                console.log(`Validando alternativa ${id_alternativa}...`);
                const alternativa = await prisma.alternativas.findUnique({
                    where: { id: id_alternativa },
                });

                if (!alternativa || alternativa.id_padrao_resp !== questao.id_padrao_resposta) {
                    console.error(`Erro: Alternativa inválida (${id_alternativa}) para questão ${questao.id}.`);
                    return res.status(400).json({
                        error: `Alternativa ${id_alternativa} inválida para a questão ${questao.id}.`,
                    });
                }

                console.log(`Salvando resposta para questão ${idQuestao}...`);
                const respostaCriada = await prisma.respostas.create({
                    data: {
                        id_avaliacao_questoes: idQuestao,
                        resposta: alternativa.descricao,
                        data_resposta,
                        avaliador_matricula,
                    },
                });
                registrosSalvos.push(respostaCriada);
                console.log(`Resposta salva com sucesso para questão ${idQuestao}.`);
            }
        }

        console.log("Todas as respostas foram salvas com sucesso:", registrosSalvos);
        return res.status(201).json({
            message: "Respostas salvas com sucesso",
            registros: registrosSalvos,
        });

    } catch (error) {
        console.error("Erro interno ao salvar respostas:", error);
        return res.status(500).json({ error: "Erro interno ao salvar respostas." });
    }
};


const getRespostasPorAvaliacao = async (req, res) => {
    try {
        const { id_avaliacao } = req.params;

        if (!id_avaliacao) {
            return res.status(400).json({ error: "ID da avaliação é obrigatório." });
        }

        console.log(`Buscando respostas para a avaliação ID: ${id_avaliacao}`);

        // Consulta para respostas padrão
        const respostasPadrao = await prisma.respostas.findMany({
            where: {
                avaliacao_questao: {
                    avaliacao: { id: parseInt(id_avaliacao) },
                },
            },
            include: {
                avaliacao_questao: {
                    include: {
                        questoes: {
                            include: {
                                dimensoes: true,
                            },
                        },
                    },
                },
            },
        });

        // Consulta para respostas adicionais (grade)
        const respostasGrade = await prisma.respostasGrade.findMany({
            where: {
                avaliacao_questao: {
                    avaliacao: { id: parseInt(id_avaliacao) },
                },
            },
            include: {
                avaliacao_questao: {
                    include: {
                        questoes: {
                            include: {
                                dimensoes: true,
                                questoes_adicionais: true,
                            },
                        },
                    },
                },
            },
        });

        // Verifica se há respostas em ao menos uma das consultas
        if (respostasPadrao.length === 0 && respostasGrade.length === 0) {
            console.log("Nenhuma resposta encontrada.");
            return res.status(404).json({ error: "Nenhuma resposta encontrada para esta avaliação." });
        }

        // Agrupa os avaliadores únicos (união das duas consultas)
        const avaliadoresUnicos = new Set([
            ...respostasPadrao.map((r) => r.avaliador_matricula),
            ...respostasGrade.map((r) => r.avaliador_matricula),
        ]).size;

        // Estrutura que conterá o relatório final
        const relatorio = {};

        /* =========================================
           Processa respostas padrão
        ============================================ */
        respostasPadrao.forEach((resposta) => {
            const questao = resposta.avaliacao_questao.questoes;
            const eixoNome = questao.dimensoes.nome;
            const questaoDescricao = questao.descricao;
            const alternativa = resposta.resposta;

            // Cria a entrada para o eixo, se ainda não existir
            if (!relatorio[eixoNome]) {
                relatorio[eixoNome] = { questoes: [] };
            }
            const eixo = relatorio[eixoNome];

            // Procura a questão dentro do eixo
            let questaoExistente = eixo.questoes.find((q) => q.descricao === questaoDescricao);
            if (!questaoExistente) {
                questaoExistente = {
                    descricao: questaoDescricao,
                    tipo: questao.id_questoes_tipo,
                    respostas: {},
                    totalRespostas: 0,
                    // Campo para armazenar as respostas adicionais (grade)
                    adicionais: {},
                };
                eixo.questoes.push(questaoExistente);
            }

            // Incrementa a contagem para a alternativa escolhida
            if (!questaoExistente.respostas[alternativa]) {
                questaoExistente.respostas[alternativa] = { absoluto: 0, porcentagem: "0.00" };
            }
            questaoExistente.respostas[alternativa].absoluto += 1;
            questaoExistente.totalRespostas += 1;
        });

        /* =========================================
           Processa respostas adicionais (grade)
        ============================================ */
        respostasGrade.forEach((respostaGrade) => {
            const questao = respostaGrade.avaliacao_questao.questoes;
            const eixoNome = questao.dimensoes.nome;
            const questaoDescricao = questao.descricao;
            const alternativa = respostaGrade.resposta;
            const adicionalId = respostaGrade.adicionalId;

            // Busca o objeto adicional (ex.: "professores", "alunos", "técnicos")
            const adicionalInfo = questao.questoes_adicionais.find((qAd) => qAd.id === adicionalId);
            if (!adicionalInfo) {
                console.warn(`Adicional com id ${adicionalId} não encontrado na questão ${questao.id}`);
                return;
            }
            const adicionalNome = adicionalInfo.descricao;

            // Cria a entrada para o eixo, se ainda não existir
            if (!relatorio[eixoNome]) {
                relatorio[eixoNome] = { questoes: [] };
            }
            const eixo = relatorio[eixoNome];

            // Procura a questão dentro do eixo
            let questaoExistente = eixo.questoes.find((q) => q.descricao === questaoDescricao);
            if (!questaoExistente) {
                // Cria a questão mesmo que não tenha respostas padrão
                questaoExistente = {
                    descricao: questaoDescricao,
                    tipo: questao.id_questoes_tipo,
                    respostas: {},
                    totalRespostas: 0,
                    adicionais: {},
                };
                eixo.questoes.push(questaoExistente);
            }

            // Cria o grupo adicional, se ainda não existir na questão
            if (!questaoExistente.adicionais[adicionalNome]) {
                questaoExistente.adicionais[adicionalNome] = {
                    respostas: {},
                    totalRespostas: 0,
                };
            }
            const grupoAdicional = questaoExistente.adicionais[adicionalNome];

            // Incrementa a contagem para a alternativa escolhida dentro do grupo adicional
            if (!grupoAdicional.respostas[alternativa]) {
                grupoAdicional.respostas[alternativa] = { absoluto: 0, porcentagem: "0.00" };
            }
            grupoAdicional.respostas[alternativa].absoluto += 1;
            grupoAdicional.totalRespostas += 1;
        });

        /* =========================================
           Calcula porcentagens para respostas padrão
           e para respostas adicionais
        ============================================ */
        Object.values(relatorio).forEach((eixo) => {
            eixo.questoes.forEach((questao) => {
                // Para respostas padrão
                const total = questao.totalRespostas;
                if (total > 0) {
                    Object.keys(questao.respostas).forEach((opcao) => {
                        questao.respostas[opcao].porcentagem = ((questao.respostas[opcao].absoluto / total) * 100).toFixed(2);
                    });
                }

                // Para cada grupo adicional (grade)
                Object.keys(questao.adicionais).forEach((adicionalNome) => {
                    const grupo = questao.adicionais[adicionalNome];
                    const totalAdicional = grupo.totalRespostas;
                    if (totalAdicional > 0) {
                        Object.keys(grupo.respostas).forEach((opcao) => {
                            grupo.respostas[opcao].porcentagem = ((grupo.respostas[opcao].absoluto / totalAdicional) * 100).toFixed(2);
                        });
                    }
                });
            });
        });

        const respostaFinal = {
            totalAvaliadores: avaliadoresUnicos,
            relatorio,
        };

        console.log("Relatório gerado com sucesso:", JSON.stringify(respostaFinal, null, 2));
        return res.status(200).json(respostaFinal);

    } catch (error) {
        console.error("Erro ao buscar respostas:", error);
        return res.status(500).json({ error: "Erro ao buscar respostas." });
    }
};


module.exports = { salvarRespostas, getRespostasPorAvaliacao };
