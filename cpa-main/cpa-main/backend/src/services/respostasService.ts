import * as respostasRepository from '../repositories/respostasRepository';
import * as avaliacaoRepository from '../repositories/avaliacaoRepository';
import { RespostaInputDTO, SalvarRespostasDTO, RelatorioFiltrosDTO } from '../dtos/RespostaDTO';
import { AppError } from '../middleware/errorMiddleware';
import prisma from '../repositories/prismaClient';

class RespostasService {
    async salvar(data: SalvarRespostasDTO, matricula: string): Promise<void> {
        const { idAvaliacao, respostas } = data;

        // Verificar se o avaliador já respondeu esta avaliação
        const jaRespondeu = await respostasRepository.findRespostaExistente(matricula, idAvaliacao);
        if (jaRespondeu) {
            throw new AppError('Você já respondeu esta avaliação.', 400);
        }

        const grouped: Record<number, RespostaInputDTO[]> = {};
        for (const r of respostas) {
            const key = Number(r.id_avaliacao_questoes);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(r);
        }

        for (const idQuestao of Object.keys(grouped).map(Number)) {
            const questaoData = await avaliacaoRepository.findAvaliacaoQuestaoWithDetails(idQuestao);
            if (!questaoData) throw new AppError(`Questão de avaliação ${idQuestao} não encontrada.`, 404);

            const questao = questaoData.questoes;
            if (!questao) throw new AppError(`Questão ${idQuestao} não encontrada no banco.`, 404);

            const grupoRespostas = grouped[idQuestao];
            const data_resposta = new Date();

            if (questao.id_questoes_tipo === 2) { // Grade
                for (const subResposta of grupoRespostas) {
                    const qAdicionalId = subResposta.id_questoes_adicionais || (subResposta as any).adicionalId || (subResposta as any).idAdicional;
                    if (!qAdicionalId) continue;

                    const idAltRaw = subResposta.id_alternativa ?? subResposta.valor ?? (subResposta as any).id_alternativas;
                    const idAlternativa = Number(idAltRaw);
                    if (isNaN(idAlternativa)) {
                        throw new AppError(`ID da alternativa inválido para a questão ${questao.id}.`, 400);
                    }

                    const alternativa = await respostasRepository.findAlternativa(idAlternativa);
                    if (!alternativa || alternativa.id_padrao_resp !== questao.id_padrao_resposta) {
                        throw new AppError(`Alternativa ${idAlternativa} inválida para a questão ${questao.id}.`, 400);
                    }

                    await respostasRepository.createRespostaGrade({
                        avaliacao_questao: { connect: { id: idQuestao } },
                        adicionalId: Number(qAdicionalId),
                        avaliador_matricula: matricula,
                        resposta: alternativa.descricao,
                        data_resposta,
                    });
                }
            } else { // Padrão
                const r = grupoRespostas[0];
                const idAltRaw = r.id_alternativa ?? r.valor ?? (r as any).id_alternativas;
                const idAlternativa = Number(idAltRaw);
                if (isNaN(idAlternativa)) {
                    throw new AppError(`ID da alternativa inválido para a questão ${questao.id}.`, 400);
                }

                const alternativa = await respostasRepository.findAlternativa(idAlternativa);
                if (!alternativa || alternativa.id_padrao_resp !== questao.id_padrao_resposta) {
                    throw new AppError(`Alternativa ${idAlternativa} inválida para a questão ${questao.id}.`, 400);
                }

                await respostasRepository.createResposta({
                    avaliacao_questao: { connect: { id: idQuestao } },
                    avaliador_matricula: matricula,
                    resposta: alternativa.descricao,
                    data_resposta,
                });
            }
        }
    }

    async getRespostasRelatorio(idAvaliacao: number) {
        // 1. Buscar todas as questões da avaliação (garante que todas apareçam e com o tipo correto)
        const avaliacaoQuestoes = await prisma.avaliacao_questoes.findMany({
            where: { id_avaliacao: idAvaliacao },
            include: {
                questoes: {
                    include: {
                        dimensoes: true,
                        questoes_adicionais: true
                    }
                }
            }
        });

        // 2. Buscar todas as respostas vinculadas a esta avaliação
        const aqIds = avaliacaoQuestoes.map(aq => aq.id);

        const [respostasPadrao, respostasGrade] = await Promise.all([
            prisma.respostas.findMany({
                where: { id_avaliacao_questoes: { in: aqIds } }
            }),
            prisma.respostasGrade.findMany({
                where: { id_avaliacao_questoes: { in: aqIds } }
            })
        ]);

        const avaliadoresUnicos = new Set([
            ...respostasPadrao.map((r: any) => r.avaliador_matricula),
            ...respostasGrade.map((r: any) => r.avaliador_matricula),
        ]).size;

        const relatorio: any = {};

        // 3. Inicializar a estrutura a partir das questões da avaliação
        avaliacaoQuestoes.forEach((aq: any) => {
            const questao = aq.questoes;
            if (!questao) return;

            const eixoNome = questao.dimensoes?.nome || 'Sem Eixo';
            const questaoDescricao = questao.descricao;

            if (!relatorio[eixoNome]) {
                relatorio[eixoNome] = { questoes: [] };
            }

            const qData: any = {
                id_avaliacao_questoes: aq.id,
                descricao: questaoDescricao,
                tipo: questao.id_questoes_tipo,
                respostas: {},
                totalRespostas: 0,
                adicionais: {}
            };

            // Inicializar sub-itens se for grade (tipo 2)
            if (questao.id_questoes_tipo === 2 && questao.questoes_adicionais) {
                questao.questoes_adicionais.forEach((qa: any) => {
                    qData.adicionais[qa.descricao] = {
                        id: qa.id,
                        respostas: {},
                        totalRespostas: 0
                    };
                });
            }

            relatorio[eixoNome].questoes.push(qData);
        });

        // 4. Preencher com respostas padrão
        respostasPadrao.forEach((r: any) => {
            // Encontrar a questão no relatório
            Object.values(relatorio).forEach((eixo: any) => {
                const q = eixo.questoes.find((q: any) => q.id_avaliacao_questoes === r.id_avaliacao_questoes);
                if (q) {
                    const alternativa = r.resposta;
                    if (!q.respostas[alternativa]) {
                        q.respostas[alternativa] = { absoluto: 0, porcentagem: "0.00" };
                    }
                    q.respostas[alternativa].absoluto += 1;
                    q.totalRespostas += 1;
                }
            });
        });

        // 5. Preencher com respostas grade
        respostasGrade.forEach((rg: any) => {
            Object.values(relatorio).forEach((eixo: any) => {
                const q = eixo.questoes.find((q: any) => q.id_avaliacao_questoes === rg.id_avaliacao_questoes);
                if (q && q.tipo === 2) {
                    const alternativa = rg.resposta;
                    const adicionalId = rg.adicionalId;

                    // Encontrar o sub-item pelo ID (precisamos do nome na estrutura)
                    const subItemNome = Object.keys(q.adicionais).find(name => q.adicionais[name].id === adicionalId);
                    if (subItemNome) {
                        const grupo = q.adicionais[subItemNome];
                        if (!grupo.respostas[alternativa]) {
                            grupo.respostas[alternativa] = { absoluto: 0, porcentagem: "0.00" };
                        }
                        grupo.respostas[alternativa].absoluto += 1;
                        grupo.totalRespostas += 1;
                    }
                }
            });
        });

        // 6. Calcular porcentagens
        Object.values(relatorio).forEach((eixo: any) => {
            eixo.questoes.forEach((q: any) => {
                if (q.totalRespostas > 0) {
                    Object.keys(q.respostas).forEach(alt => {
                        q.respostas[alt].porcentagem = ((q.respostas[alt].absoluto / q.totalRespostas) * 100).toFixed(2);
                    });
                }
                Object.keys(q.adicionais).forEach(sub => {
                    const g = q.adicionais[sub];
                    if (g.totalRespostas > 0) {
                        Object.keys(g.respostas).forEach(alt => {
                            g.respostas[alt].porcentagem = ((g.respostas[alt].absoluto / g.totalRespostas) * 100).toFixed(2);
                        });
                    }
                });
            });
        });

        return {
            totalAvaliadores: avaliadoresUnicos,
            relatorio,
        };
    }
}

export default new RespostasService();
