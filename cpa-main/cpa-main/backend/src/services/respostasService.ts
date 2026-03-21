import * as respostasRepository from '../repositories/respostasRepository';
import * as avaliacaoRepository from '../repositories/avaliacaoRepository';
import { RespostaInputDTO, SalvarRespostasDTO, RelatorioFiltrosDTO } from '../dtos/RespostaDTO';
import { AppError } from '../middleware/errorMiddleware';

class RespostasService {
    async salvar(data: SalvarRespostasDTO, matricula: string): Promise<void> {
        const { respostas } = data;

        const grouped: Record<number, RespostaInputDTO[]> = {};
        for (const r of respostas) {
            const key = Number(r.id_avaliacao_questoes);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(r);
        }

        for (const idQuestao of Object.keys(grouped).map(Number)) {
            const questaoData = await avaliacaoRepository.findAvaliacaoQuestaoWithDetails(idQuestao);
            if (!questaoData) throw new AppError(`Questão de avaliação ${idQuestao} não encontrada.`, 404);

            const grupoRespostas = grouped[idQuestao];

            if (questaoData.questoes?.id_questoes_tipo === 2) { // Grade
                for (const subResposta of grupoRespostas) {
                    if (!subResposta.id_questoes_adicionais) continue;

                    const idAdicional = typeof subResposta.id_questoes_adicionais === 'string'
                        ? subResposta.id_questoes_adicionais
                        : Number(subResposta.id_questoes_adicionais);

                    await respostasRepository.createRespostaGrade({
                        avaliacao_questao: { connect: { id: idQuestao } },
                        adicionalId: Number(idAdicional),
                        avaliador_matricula: matricula,
                        resposta: subResposta.valor ? subResposta.valor.toString() : '',
                        data_resposta: new Date(),
                    });
                }
            } else { // Padrão
                const r = grupoRespostas[0];
                await respostasRepository.createResposta({
                    avaliacao_questao: { connect: { id: idQuestao } },
                    avaliador_matricula: matricula,
                    resposta: r.valor ? r.valor.toString() : '',
                    data_resposta: new Date(),
                });
            }
        }
    }

    async getRespostasRelatorio(idAvaliacao: number) {
        const [respostasPadrao, respostasGrade] = await Promise.all([
            respostasRepository.findRespostasByAvaliacao(idAvaliacao),
            respostasRepository.findRespostasGradeByAvaliacao(idAvaliacao)
        ]);

        return this.groupRespostasParaRelatorio(respostasPadrao, respostasGrade);
    }

    private groupRespostasParaRelatorio(padrao: any[], grade: any[]) {
        const total: Record<number, any> = {};

        padrao.forEach(r => {
            const aq = r.avaliacao_questao;
            const q = aq.questoes;
            if (!total[q.id]) {
                total[q.id] = {
                    id: q.id,
                    descricao: q.descricao,
                    dimensao: q.dimensoes?.nome,
                    respostas: [],
                    tipo: 'padrao'
                };
            }
            total[q.id].respostas.push({ valor: r.resposta, comentario: r.comentario });
        });

        grade.forEach(r => {
            const aq = r.avaliacao_questao;
            const q = aq.questoes;
            if (!total[q.id]) {
                total[q.id] = {
                    id: q.id,
                    descricao: q.descricao,
                    dimensao: q.dimensoes?.nome,
                    respostas: {},
                    tipo: 'grade'
                };
            }
            const subKey = r.adicionalId;
            if (!total[q.id].respostas[subKey]) {
                total[q.id].respostas[subKey] = [];
            }
            total[q.id].respostas[subKey].push({ valor: r.resposta, comentario: r.comentario });
        });

        return Object.values(total);
    }
}

export default new RespostasService();
