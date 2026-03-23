import * as respostasRepository from '../repositories/respostasRepository';
import * as avaliacaoRepository from '../repositories/avaliacaoRepository';
import { RespostaInputDTO, SalvarRespostasDTO, RelatorioFiltrosDTO } from '../dtos/RespostaDTO';
import { AppError } from '../middleware/errorMiddleware';

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
                    if (!subResposta.id_questoes_adicionais) continue;

                    const idAlternativa = Number(subResposta.id_alternativa ?? subResposta.valor);
                    if (isNaN(idAlternativa)) {
                        throw new AppError(`ID da alternativa inválido para a questão ${questao.id}.`, 400);
                    }

                    const alternativa = await respostasRepository.findAlternativa(idAlternativa);
                    if (!alternativa || alternativa.id_padrao_resp !== questao.id_padrao_resposta) {
                        throw new AppError(`Alternativa ${idAlternativa} inválida para a questão ${questao.id}.`, 400);
                    }

                    await respostasRepository.createRespostaGrade({
                        avaliacao_questao: { connect: { id: idQuestao } },
                        adicionalId: Number(subResposta.id_questoes_adicionais),
                        avaliador_matricula: matricula,
                        resposta: alternativa.descricao,
                        data_resposta,
                    });
                }
            } else { // Padrão
                const r = grupoRespostas[0];
                const idAlternativa = Number(r.id_alternativa ?? r.valor);
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
        const [respostasPadrao, respostasGrade] = await Promise.all([
            respostasRepository.findRespostasByAvaliacao(idAvaliacao),
            respostasRepository.findRespostasGradeByAvaliacao(idAvaliacao)
        ]);

        const avaliadoresUnicos = new Set([
            ...respostasPadrao.map((r: any) => r.avaliador_matricula),
            ...respostasGrade.map((r: any) => r.avaliador_matricula),
        ]).size;

        const relatorio: Record<string, any> = {};

        // Processar respostas padrão
        respostasPadrao.forEach((resposta: any) => {
            const questao = resposta.avaliacao_questao.questoes;
            const eixoNome = questao.dimensoes?.nome || 'Sem Eixo';
            const questaoDescricao = questao.descricao;
            const alternativaLabel = resposta.resposta;

            if (!relatorio[eixoNome]) {
                relatorio[eixoNome] = { questoes: [] };
            }

            let qExistente = relatorio[eixoNome].questoes.find((q: any) => q.descricao === questaoDescricao);
            if (!qExistente) {
                qExistente = {
                    descricao: questaoDescricao,
                    tipo: questao.id_questoes_tipo,
                    respostas: {},
                    totalRespostas: 0,
                    adicionais: {},
                };
                relatorio[eixoNome].questoes.push(qExistente);
            }

            if (!qExistente.respostas[alternativaLabel]) {
                qExistente.respostas[alternativaLabel] = { absoluto: 0, porcentagem: "0.00" };
            }
            qExistente.respostas[alternativaLabel].absoluto += 1;
            qExistente.totalRespostas += 1;
        });

        // Processar respostas grade
        respostasGrade.forEach((rGrade: any) => {
            const questao = rGrade.avaliacao_questao.questoes;
            const eixoNome = questao.dimensoes?.nome || 'Sem Eixo';
            const questaoDescricao = questao.descricao;
            const alternativaLabel = rGrade.resposta;
            const adicionalId = rGrade.adicionalId;

            const adicionalInfo = questao.questoes_adicionais?.find((qa: any) => qa.id === adicionalId);
            const adicionalNome = adicionalInfo ? adicionalInfo.descricao : `Subitem ${adicionalId}`;

            if (!relatorio[eixoNome]) {
                relatorio[eixoNome] = { questoes: [] };
            }

            let qExistente = relatorio[eixoNome].questoes.find((q: any) => q.descricao === questaoDescricao);
            if (!qExistente) {
                qExistente = {
                    descricao: questaoDescricao,
                    tipo: questao.id_questoes_tipo,
                    respostas: {},
                    totalRespostas: 0,
                    adicionais: {},
                };
                relatorio[eixoNome].questoes.push(qExistente);
            }

            if (!qExistente.adicionais[adicionalNome]) {
                qExistente.adicionais[adicionalNome] = {
                    respostas: {},
                    totalRespostas: 0,
                };
            }

            const grupoAdicional = qExistente.adicionais[adicionalNome];
            if (!grupoAdicional.respostas[alternativaLabel]) {
                grupoAdicional.respostas[alternativaLabel] = { absoluto: 0, porcentagem: "0.00" };
            }
            grupoAdicional.respostas[alternativaLabel].absoluto += 1;
            grupoAdicional.totalRespostas += 1;
        });

        // Calcular porcentagens
        Object.values(relatorio).forEach((eixo: any) => {
            eixo.questoes.forEach((q: any) => {
                // Padrão
                if (q.totalRespostas > 0) {
                    Object.keys(q.respostas).forEach((alt: string) => {
                        q.respostas[alt].porcentagem = ((q.respostas[alt].absoluto / q.totalRespostas) * 100).toFixed(2);
                    });
                }
                // Adicionais
                Object.keys(q.adicionais).forEach((adNome: string) => {
                    const grupo = q.adicionais[adNome];
                    if (grupo.totalRespostas > 0) {
                        Object.keys(grupo.respostas).forEach((alt: string) => {
                            grupo.respostas[alt].porcentagem = ((grupo.respostas[alt].absoluto / grupo.totalRespostas) * 100).toFixed(2);
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
