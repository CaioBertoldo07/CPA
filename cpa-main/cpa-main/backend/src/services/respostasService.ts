import * as respostasRepository from '../repositories/respostasRepository';
import * as avaliacaoRepository from '../repositories/avaliacaoRepository';
import { RespostaInputDTO, SalvarRespostasDTO, RelatorioFiltrosDTO } from '../dtos/RespostaDTO';
import { AppError } from '../middleware/errorMiddleware';
import prisma from '../repositories/prismaClient';
import { hashMatricula } from '../utils/hashUtils';
import LyceumService from './lyceumService';

const lyceumService = new LyceumService();

class RespostasService {
    async salvar(data: SalvarRespostasDTO, matricula: string): Promise<void> {
        const { idAvaliacao, respostas, universityToken } = data;

        // 1. Hash da matrícula para anonimato
        const matriculaHash = hashMatricula(matricula);

        // 2. Verificar se o avaliador já respondeu esta avaliação
        // Checa tanto pelo hash (novos registros) quanto pela matrícula crua (registros anteriores à migração),
        // para preservar a regra de 1 resposta por avaliação durante o período de transição.
        const jaRespondeu = await prisma.respostas.findFirst({
            where: {
                avaliador_matricula: { in: [matriculaHash, matricula] },
                avaliacao_questao: { avaliacao: { id: idAvaliacao } },
            },
        });
        if (jaRespondeu) {
            throw new AppError('Você já respondeu esta avaliação.', 400);
        }

        // 3. Obter dados demográficos do Lyceum
        let curso = null;
        let unidade = null;
        let municipio = null;

        if (universityToken) {
            try {
                const alunoInfo = await lyceumService.getAlunoInfo(universityToken);
                if (alunoInfo) {
                    curso = alunoInfo.CURSO_NOME;
                    unidade = alunoInfo.UNIDADE_NOME;
                    
                    // Normaliza a sigla da unidade recebida do Lyceum (ex: "est" -> "EST")
                    const siglaUnidade = alunoInfo.UNIDADE
                        ? alunoInfo.UNIDADE.trim().toUpperCase()
                        : null;

                    // Buscar o município da unidade no nosso banco usando a SIGLA (ex: EST)
                    if (siglaUnidade) {
                        const unidadeDB = await prisma.unidades.findFirst({
                            where: { sigla: { equals: siglaUnidade } }
                        });
                        municipio = unidadeDB?.municipio_vinculo || null;
                    } else {
                        municipio = null;
                    }
                }
            } catch (err) {
                console.error('Erro ao buscar dados demográficos no Lyceum:', err);
                // Não bloqueamos a resposta caso o Lyceum falhe, apenas salvamos sem demographics
            }
        }

        const grouped: Record<string, RespostaInputDTO[]> = {};
        for (const r of respostas) {
            const key = String(r.id_avaliacao_questoes);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(r);
        }

        for (const idQuestaoKey of Object.keys(grouped)) {
            const [idQuestaoStr, disciplinaFromId] = idQuestaoKey.split('___');
            const idQuestao = Number(idQuestaoStr);
            const questaoData = await avaliacaoRepository.findAvaliacaoQuestaoWithDetails(idQuestao);
            if (!questaoData) throw new AppError(`Questão de avaliação ${idQuestao} não encontrada.`, 404);

            const questao = questaoData.questoes;
            if (!questao) throw new AppError(`Questão ${idQuestao} não encontrada no banco.`, 404);

            const grupoRespostas = grouped[idQuestaoKey];
            const data_resposta = new Date();

            if (questao.id_questoes_tipo === 2) { // Grade
                for (const subResposta of grupoRespostas) {
                    const qAdicionalId = subResposta.id_questoes_adicionais || (subResposta as any).adicionalId || (subResposta as any).idAdicional;
                    if (!qAdicionalId) continue;

                    const isDynamicSubject = typeof qAdicionalId === 'string' && qAdicionalId.startsWith('DISC_');
                    const finalAdicionalId = isDynamicSubject ? 0 : Number(qAdicionalId);
                    const disciplinaNome = isDynamicSubject ? qAdicionalId.replace('DISC_', '') : null;

                    const idAltRaw = subResposta.id_alternativa ?? subResposta.valor ?? (subResposta as any).id_alternativas;
                    const idAlternativa = Number(idAltRaw);
                    if (isNaN(idAlternativa)) {
                        throw new AppError(`ID da alternativa inválido para a questão ${questao.id}.`, 400);
                    }

                    const alternativa = await respostasRepository.findAlternativa(idAlternativa);
                    if (!alternativa || alternativa.id_padrao_resp !== questao.id_padrao_resposta) {
                        throw new AppError(`Alternativa ${idAlternativa} inválida para a questão ${questao.id}.`, 400);
                    }

                    await (respostasRepository as any).createRespostaGrade({
                        avaliacao_questao: { connect: { id: idQuestao } },
                        adicionalId: finalAdicionalId,
                        avaliador_matricula: matriculaHash,
                        resposta: alternativa.descricao,
                        data_resposta,
                        curso,
                        unidade,
                        municipio,
                        disciplina: disciplinaNome || disciplinaFromId || (subResposta as any).disciplina || null
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

                await (respostasRepository as any).createResposta({
                    avaliacao_questao: { connect: { id: idQuestao } },
                    avaliador_matricula: matriculaHash,
                    resposta: alternativa.descricao,
                    data_resposta,
                    curso,
                    unidade,
                    municipio,
                    disciplina: disciplinaFromId || (r as any).disciplina || null
                });
            }
        }
    }

    async getRespostasRelatorio(idAvaliacao: number, filtros: { unidade?: string, curso?: string, municipio?: string } = {}) {
        // 1. Buscar a estrutura da avaliação (Eixos -> Dimensões -> Questões)
        const avaliacaoQuestoes = await prisma.avaliacao_questoes.findMany({
            where: { id_avaliacao: idAvaliacao },
            include: {
                questoes: {
                    include: {
                        dimensoes: {
                            include: { eixos: true }
                        },
                        questoes_adicionais: true,
                        padrao_resposta: {
                            include: { alternativas: true }
                        }
                    }
                }
            }
        });

        // 2. Buscar todas as respostas vinculadas a esta avaliação com filtros
        const aqIds = avaliacaoQuestoes.map(aq => aq.id);
        const whereClause: any = { id_avaliacao_questoes: { in: aqIds } };
        if (filtros.unidade) whereClause.unidade = filtros.unidade;
        if (filtros.curso) whereClause.curso = filtros.curso;
        if (filtros.municipio) whereClause.municipio = filtros.municipio;

        const [respostasPadrao, respostasGrade] = await Promise.all([
            prisma.respostas.findMany({ where: whereClause }),
            prisma.respostasGrade.findMany({ where: whereClause })
        ]);

        const avaliadoresUnicos = new Set([
            ...respostasPadrao.map((r: any) => r.avaliador_matricula),
            ...respostasGrade.map((r: any) => r.avaliador_matricula),
        ]).size;

        const relatorio: any = {};
        const questionMap: Record<number, any> = {};

        // 3. Inicializar a estrutura Hierárquica
        avaliacaoQuestoes.forEach((aq: any) => {
            const questao = aq.questoes;
            if (!questao) return;

            const dimensao = questao.dimensoes;
            const eixo = dimensao?.eixos;

            const eixoKey = eixo ? `${eixo.numero} - ${eixo.nome}` : 'A. Geral';
            const dimensaoKey = dimensao ? `${dimensao.numero} - ${dimensao.nome}` : 'Geral';

            if (!relatorio[eixoKey]) {
                relatorio[eixoKey] = {
                    nome: eixo?.nome || 'Geral',
                    numero: eixo?.numero || 0,
                    dimensoes: {}
                };
            }

            if (!relatorio[eixoKey].dimensoes[dimensaoKey]) {
                relatorio[eixoKey].dimensoes[dimensaoKey] = {
                    nome: dimensao?.nome || 'Geral',
                    numero: dimensao?.numero || 0,
                    questoes: []
                };
            }

            const alts = questao.padrao_resposta?.alternativas || [];
            const initialRespostas: any = {};
            alts.forEach((a: any) => {
                initialRespostas[a.descricao] = { absoluto: 0, porcentagem: "0.00" };
            });

            const qData: any = {
                id_avaliacao_questoes: aq.id,
                descricao: questao.descricao,
                tipo: questao.id_questoes_tipo,
                id_tipo: questao.id_questoes_tipo,
                dimensao: dimensao?.nome || 'Geral',
                repetir_todas_disciplinas: questao.repetir_todas_disciplinas,
                respostas: initialRespostas,
                totalRespostas: 0,
                adicionais: {},
                por_disciplina: {}
            };

            if (questao.id_questoes_tipo === 2 && questao.questoes_adicionais) {
                questao.questoes_adicionais.forEach((qa: any) => {
                    qData.adicionais[qa.descricao] = {
                        id: qa.id,
                        respostas: JSON.parse(JSON.stringify(initialRespostas)),
                        totalRespostas: 0,
                        por_disciplina: {}
                    };
                });
            }

            relatorio[eixoKey].dimensoes[dimensaoKey].questoes.push(qData);
            questionMap[aq.id] = qData;
        });

        // 4. Preencher com respostas padrão
        respostasPadrao.forEach((r: any) => {
            const q = questionMap[r.id_avaliacao_questoes];
            if (!q) return;

            const alternativa = r.resposta;
            const disc = r.disciplina || 'Geral';

            // Global
            if (!q.respostas[alternativa]) q.respostas[alternativa] = { absoluto: 0, porcentagem: "0.00" };
            q.respostas[alternativa].absoluto += 1;
            q.totalRespostas += 1;

            // Por Disciplina
            if (q.repetir_todas_disciplinas) {
                if (!q.por_disciplina[disc]) q.por_disciplina[disc] = { respostas: {}, total: 0 };
                if (!q.por_disciplina[disc].respostas[alternativa]) q.por_disciplina[disc].respostas[alternativa] = 0;
                q.por_disciplina[disc].respostas[alternativa] += 1;
                q.por_disciplina[disc].total += 1;
            }
        });

        // 5. Preencher com respostas grade
        respostasGrade.forEach((rg: any) => {
            const q = questionMap[rg.id_avaliacao_questoes];
            if (!q || q.tipo !== 2) return;

            const alternativa = rg.resposta;
            const adicionalId = rg.adicionalId;
            const disc = rg.disciplina || 'Geral';

            const subItemNome = Object.keys(q.adicionais).find(name => q.adicionais[name].id === adicionalId);
            if (subItemNome) {
                const grupo = q.adicionais[subItemNome];
                
                // Global
                if (!grupo.respostas[alternativa]) grupo.respostas[alternativa] = { absoluto: 0, porcentagem: "0.00" };
                grupo.respostas[alternativa].absoluto += 1;
                grupo.totalRespostas += 1;

                // Por Disciplina
                if (q.repetir_todas_disciplinas) {
                    // Atualizar no grupo (sub-item)
                    if (!grupo.por_disciplina[disc]) grupo.por_disciplina[disc] = { respostas: {}, total: 0 };
                    if (!grupo.por_disciplina[disc].respostas[alternativa]) grupo.por_disciplina[disc].respostas[alternativa] = 0;
                    grupo.por_disciplina[disc].respostas[alternativa] += 1;
                    grupo.por_disciplina[disc].total += 1;

                    // Também atualizar no pai (questão) para o seletor do carrossel saber que esta disciplina existe
                    if (!q.por_disciplina[disc]) q.por_disciplina[disc] = { respostas: {}, total: 0 };
                    q.por_disciplina[disc].total += 1;
                }
            }
        });

        // 6. Calcular porcentagens
        Object.values(questionMap).forEach((q: any) => {
            const calcPct = (total: number, map: any) => {
                if (total > 0) {
                    Object.keys(map).forEach(alt => {
                        map[alt].porcentagem = ((map[alt].absoluto / total) * 100).toFixed(2);
                    });
                }
            };

            calcPct(q.totalRespostas, q.respostas);
            Object.values(q.adicionais).forEach((g: any) => calcPct(g.totalRespostas, g.respostas));

            // Porcentagens por disciplina
            if (q.repetir_todas_disciplinas) {
                const calcDiscPct = (discMap: any) => {
                    Object.values(discMap).forEach((d: any) => {
                        d.respostas_pct = {};
                        if (d.total > 0) {
                            Object.entries(d.respostas).forEach(([alt, count]: [string, any]) => {
                                d.respostas_pct[alt] = ((count / d.total) * 100).toFixed(2);
                            });
                        }
                    });
                };
                calcDiscPct(q.por_disciplina);
                Object.values(q.adicionais).forEach((g: any) => calcDiscPct(g.por_disciplina));
            }
        });

        // 7. Agrupar participações
        const participacao: any = { unidade: {}, curso: {}, municipio: {} };
        const vUnicos = new Set();
        [...respostasPadrao, ...respostasGrade].forEach((r: any) => {
            const key = `${r.avaliador_matricula}-${r.unidade}-${r.curso}-${r.municipio}`;
            if (!vUnicos.has(key)) {
                vUnicos.add(key);
                if (r.unidade) participacao.unidade[r.unidade] = (participacao.unidade[r.unidade] || 0) + 1;
                if (r.curso) participacao.curso[r.curso] = (participacao.curso[r.curso] || 0) + 1;
                if (r.municipio) participacao.municipio[r.municipio] = (participacao.municipio[r.municipio] || 0) + 1;
            }
        });

        return {
            totalAvaliadores: avaliadoresUnicos,
            relatorio,
            participacao
        };
    }

    async getRelatorioDisciplinas(idAvaliacao: number, filtros: { unidade?: string, curso?: string }) {
        // 1. Buscar a estrutura da avaliação (Eixos -> Dimensões -> Questões)
        const avaliacaoQuestoes = await prisma.avaliacao_questoes.findMany({
            where: { id_avaliacao: idAvaliacao },
            include: {
                questoes: {
                    include: {
                        padrao_resposta: {
                            include: { alternativas: { orderBy: { id: 'asc' } } }
                        }
                    }
                }
            }
        });

        const aqIds = avaliacaoQuestoes.map(aq => aq.id);

        // 2. Buscar todas as respostas (padrão e grade) filtrando por unidade/curso
        const whereClause: any = { id_avaliacao_questoes: { in: aqIds } };
        if (filtros.unidade) whereClause.unidade = filtros.unidade;
        if (filtros.curso) whereClause.curso = filtros.curso;

        const [respostasPadrao, respostasGrade] = await Promise.all([
            prisma.respostas.findMany({ where: whereClause }),
            prisma.respostasGrade.findMany({ where: whereClause })
        ]);

        // 3. Mapear pesos das alternativas (Indice 0 = 100%, Indice N-1 = 0%)
        const questaoMeta: Record<number, any> = {};
        avaliacaoQuestoes.forEach(aq => {
            const alts = aq.questoes?.padrao_resposta?.alternativas || [];
            questaoMeta[aq.id] = {
                descricao: aq.questoes?.descricao,
                alternativas: alts.map(a => a.descricao),
                pesos: alts.map((a, i) => alts.length > 1 ? (alts.length - 1 - i) / (alts.length - 1) : 1)
            };
        });

        // 4. Agrupar por Disciplina
        const disciplinas: Record<string, any> = {};

        const processarResposta = (r: any, idAq: number) => {
            const disc = r.disciplina || 'Geral/Outros';
            if (!disciplinas[disc]) {
                disciplinas[disc] = {
                    nome: disc,
                    totalRespostas: 0,
                    somaPontos: 0,
                    questoes: {}
                };
            }

            const meta = questaoMeta[idAq];
            if (!meta) return;

            const altIndex = meta.alternativas.indexOf(r.resposta);
            if (altIndex === -1) return;

            const pontos = meta.pesos[altIndex];
            
            disciplinas[disc].totalRespostas += 1;
            disciplinas[disc].somaPontos += pontos;

            if (!disciplinas[disc].questoes[idAq]) {
                disciplinas[disc].questoes[idAq] = {
                    descricao: meta.descricao,
                    total: 0,
                    soma: 0,
                    respostas: {}
                };
            }
            disciplinas[disc].questoes[idAq].total += 1;
            disciplinas[disc].questoes[idAq].soma += pontos;
            
            // Contabilizar cada alternativa individualmente
            if (!disciplinas[disc].questoes[idAq].respostas[r.resposta]) {
                disciplinas[disc].questoes[idAq].respostas[r.resposta] = 0;
            }
            disciplinas[disc].questoes[idAq].respostas[r.resposta] += 1;
        };

        respostasPadrao.forEach(r => processarResposta(r, r.id_avaliacao_questoes));
        respostasGrade.forEach(rg => processarResposta(rg, rg.id_avaliacao_questoes));

        // 5. Formatar Ranking
        const ranking = Object.values(disciplinas).map((d: any) => {
            const scoreGeral = d.totalRespostas > 0 ? (d.somaPontos / d.totalRespostas) * 100 : 0;
            
            const questoesRanking = Object.entries(d.questoes).map(([id, q]: [string, any]) => ({
                id_avaliacao_questoes: Number(id),
                descricao: q.descricao,
                total: q.total,
                score: q.total > 0 ? (q.soma / q.total) * 100 : 0,
                respostas: q.respostas,
                alternativas: questaoMeta[Number(id)].alternativas
            }));

            return {
                disciplina: d.nome,
                totalRespostas: d.totalRespostas,
                scoreGeral: Number(scoreGeral.toFixed(2)),
                questoes: questoesRanking
            };
        }).sort((a, b) => b.scoreGeral - a.scoreGeral);

        return ranking;
    }
}

export default new RespostasService();
