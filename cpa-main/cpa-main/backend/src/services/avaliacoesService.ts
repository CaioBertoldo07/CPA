import * as avaliacaoRepository from '../repositories/avaliacaoRepository';
import { AvaliacaoResponseDTO, CreateAvaliacaoDTO } from '../dtos/AvaliacaoDTO';
import { AppError } from '../middleware/errorMiddleware';
import { UserResponseDTO } from '../dtos/AuthDTO';
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({
    rejectUnauthorized: process.env.DISABLE_SSL_VALIDATION !== 'true',
});

class AvaliacoesService {
    private mapAvaliacao(avaliacao: any): AvaliacaoResponseDTO {
        return {
            ...avaliacao,
            titulo: `Avaliação CPA - ${avaliacao.periodo_letivo}`,
            questoes: (avaliacao.avaliacao_questoes || []).map((aq: any) => ({
                ...aq.questoes,
                id_avaliacao_questao: aq.id
            }))
        } as unknown as AvaliacaoResponseDTO;
    }

    async create(data: CreateAvaliacaoDTO): Promise<AvaliacaoResponseDTO> {
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
        } = data;

        // Validações de existência via repositório
        const [uExist, cExist, catExist, modExist, qExist] = await Promise.all([
            avaliacaoRepository.validateUnidades(unidade),
            avaliacaoRepository.validateCursos(cursos),
            avaliacaoRepository.validateCategorias(categorias),
            avaliacaoRepository.validateModalidades(modalidade),
            avaliacaoRepository.validateQuestoes(questoes)
        ]);

        if (uExist.length !== unidade.length) throw new AppError('Uma ou mais unidades não encontradas.', 404);
        if (cExist.length !== cursos.length) throw new AppError('Um ou mais cursos não encontrados.', 404);
        if (catExist.length !== categorias.length) throw new AppError('Uma ou mais categorias não encontrados.', 404);
        if (modExist.length !== modalidade.length) throw new AppError('Uma ou mais modalidades não encontradas.', 404);
        if (qExist.length !== questoes.length) throw new AppError('Uma ou mais questões não encontradas.', 404);

        const avaliacao = await avaliacaoRepository.create({
            periodo_letivo,
            data_inicio: new Date(data_inicio),
            data_fim: new Date(data_fim),
            status,
            ano,
            unidade: { connect: unidade.map(id => ({ id })) },
            modalidades: { connect: modalidade.map(id => ({ id })) },
            avaliacao_questoes: {
                create: questoes.map(questaoId => ({
                    questoes: { connect: { id: questaoId } },
                })),
            },
            cursos: { connect: cursos.map(identificador => ({ identificador_api_lyceum: identificador })) },
            categorias: { connect: categorias.map(id => ({ id })) },
        });

        return this.mapAvaliacao(avaliacao);
    }

    async getAll(): Promise<AvaliacaoResponseDTO[]> {
        const avaliacoes = await avaliacaoRepository.findMany();
        return avaliacoes.map(a => this.mapAvaliacao(a));
    }

    async getDisponiveis(cursoUsuario: string, matricula: string): Promise<AvaliacaoResponseDTO[]> {
        const avaliacoes = await avaliacaoRepository.findDisponiveis(cursoUsuario, new Date());

        if (avaliacoes.length === 0) return [];

        const avaliacaoIds = avaliacoes.map(a => a.id);
        const respondidas = await avaliacaoRepository.findAvaliacoesRespondidasPeloAvaliador(matricula, avaliacaoIds);
        const respondidasIds = new Set(respondidas.map(r => r.avaliacao_questao?.id_avaliacao).filter(Boolean));

        const avaliacoesNaoRespondidas = avaliacoes.filter(a => !respondidasIds.has(a.id));

        return avaliacoesNaoRespondidas.map(a => this.mapAvaliacao(a));
    }

    async getById(id: number, user?: UserResponseDTO): Promise<AvaliacaoResponseDTO> {
        const avaliacao = await avaliacaoRepository.findById(id);
        if (!avaliacao) throw new AppError('Avaliação não encontrada.', 404);

        if (user && user.oberonPerfilNome === 'DISCENTE') {
            const [anoAvaliacao, semestreAvaliacao] = (avaliacao.periodo_letivo as string).split('.');
            const disciplinas = await this.getDisciplinasAluno(anoAvaliacao, semestreAvaliacao, user.universityToken);

            if (disciplinas.message?.length > 0) {
                (avaliacao as any).avaliacao_questoes = (avaliacao.avaliacao_questoes as any[]).filter(
                    (aq: any) => aq?.questoes?.id !== 18
                );

                const gradeQuestao = await avaliacaoRepository.findQuestaoGradeById(18);
                if (gradeQuestao) {
                    for (const disciplina of disciplinas.message) {
                        if (!disciplina.DISC_DISCIPLINA || !disciplina.DISC_NOME) continue;
                        const questaoClone = JSON.parse(JSON.stringify(gradeQuestao));
                        questaoClone.questoes_adicionais.push({
                            id: `DISC_${disciplina.DISC_DISCIPLINA}`,
                            descricao: `${disciplina.DISC_DISCIPLINA} - ${disciplina.DISC_NOME}`,
                            questao_id: 18,
                        });
                        (avaliacao as any).avaliacao_questoes.push({
                            id: `DISC_${disciplina.DISC_DISCIPLINA}_QUESTAO`,
                            descricao: `${disciplina.DISC_DISCIPLINA} - ${disciplina.DISC_NOME}`,
                            questoes: questaoClone,
                        });
                    }
                }
            }
        }

        return this.mapAvaliacao(avaliacao);
    }

    async hasUserResponded(matricula: string, idAvaliacao: number): Promise<boolean> {
        const resposta = await avaliacaoRepository.findRespostaDoAvaliador(matricula, idAvaliacao);
        return !!resposta;
    }

    async editar(id: number, data: CreateAvaliacaoDTO): Promise<AvaliacaoResponseDTO> {
        const existing = await avaliacaoRepository.findByIdSimple(id);
        if (!existing) throw new AppError('Avaliação não encontrada.', 404);
        if (existing.status !== 1) throw new AppError('Apenas rascunhos podem ser editados.', 400);

        const { unidade, cursos, categorias, modalidade, questoes, periodo_letivo, data_inicio, data_fim, ano } = data;

        const [uExist, cExist, catExist, modExist, qExist] = await Promise.all([
            avaliacaoRepository.validateUnidades(unidade),
            avaliacaoRepository.validateCursos(cursos),
            avaliacaoRepository.validateCategorias(categorias),
            avaliacaoRepository.validateModalidades(modalidade),
            avaliacaoRepository.validateQuestoes(questoes)
        ]);

        if (uExist.length !== unidade.length) throw new AppError('Uma ou mais unidades não encontradas.', 404);
        if (cExist.length !== cursos.length) throw new AppError('Um ou mais cursos não encontrados.', 404);
        if (catExist.length !== categorias.length) throw new AppError('Uma ou mais categorias não encontrados.', 404);
        if (modExist.length !== modalidade.length) throw new AppError('Uma ou mais modalidades não encontradas.', 404);
        if (qExist.length !== questoes.length) throw new AppError('Uma ou mais questões não encontradas.', 404);

        const avaliacao = await avaliacaoRepository.update(id, {
            periodo_letivo,
            data_inicio: new Date(data_inicio),
            data_fim: new Date(data_fim),
            ano,
            unidade: { set: unidade.map(uid => ({ id: uid })) },
            modalidades: { set: modalidade.map(mid => ({ id: mid })) },
            cursos: { set: cursos.map(identificador => ({ identificador_api_lyceum: identificador })) },
            categorias: { set: categorias.map(cid => ({ id: cid })) },
            avaliacao_questoes: {
                deleteMany: {},
                create: questoes.map(questaoId => ({
                    questoes: { connect: { id: questaoId } },
                })),
            },
        });

        return this.mapAvaliacao(avaliacao);
    }

    async switchStatus(id: number, newStatus: number): Promise<AvaliacaoResponseDTO> {
        const avaliacao = await avaliacaoRepository.findByIdSimple(id);
        if (!avaliacao) throw new AppError('Avaliação não encontrada.', 404);

        if (newStatus === 2) { // Enviar (Rascunho -> Enviada)
            if (avaliacao.status !== 1) throw new AppError('Apenas rascunhos podem ser enviados.', 400);
            this.validateCompleteness(avaliacao);
        }

        return (await avaliacaoRepository.update(id, { status: newStatus }) as unknown) as AvaliacaoResponseDTO;
    }

    async prorrogar(id: number, data_fim: string): Promise<AvaliacaoResponseDTO> {
        const avaliacao = await avaliacaoRepository.findByIdSimple(id);
        if (!avaliacao) throw new AppError('Avaliação não encontrada.', 404);
        if (avaliacao.status !== 2) throw new AppError('Apenas avaliações enviadas podem ser prorrogadas.', 400);

        const agora = new Date();
        const novaDataFim = new Date(data_fim);
        if (new Date(avaliacao.data_fim) < agora) throw new AppError('Avaliações encerradas não podem ser prorrogadas.', 400);
        if (novaDataFim <= agora) throw new AppError('A nova data de encerramento deve ser uma data futura.', 400);
        if (novaDataFim <= new Date(avaliacao.data_fim)) throw new AppError('A nova data deve ser posterior à atual.', 400);

        return (await avaliacaoRepository.update(id, { data_fim: novaDataFim }) as unknown) as AvaliacaoResponseDTO;
    }

    async delete(id: number): Promise<void> {
        const avaliacao = await avaliacaoRepository.findByIdSimple(id);
        if (!avaliacao) throw new AppError('Avaliação não encontrada.', 404);
        if (avaliacao.status === 2 || avaliacao.status === 3) throw new AppError('Avaliações enviadas/encerradas não podem ser excluídas.', 400);

        const avaliacaoQuestoes = await avaliacaoRepository.findAvaliacaoQuestoes(id);
        const idsQuestoes = avaliacaoQuestoes.map(aq => aq.id);

        if (idsQuestoes.length > 0) {
            const [resp, respG] = await Promise.all([
                avaliacaoRepository.findRespostasExistentes(idsQuestoes),
                avaliacaoRepository.findRespostasGradeExistentes(idsQuestoes)
            ]);
            if (resp || respG) throw new AppError('Esta avaliação possui respostas e não pode ser excluída.', 400);
        }

        await avaliacaoRepository.remove(id);
    }

    private validateCompleteness(avaliacao: any) {
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

        if (erros.length > 0) throw new AppError(`Avaliação incompleta: ${erros.join(' ')}`, 400);
    }

    private async getDisciplinasAluno(ano: string, semestre: string, token: string) {
        const url = `https://api.uea.edu.br/lyceum/cadu/aluno/historico/matriculapessoal/ano/${ano}/semestre/${semestre}`;
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                httpsAgent,
            });
            return response.data;
        } catch (error) {
            console.error('Erro API University:', error);
            return { error: 'Erro ao buscar disciplinas.' };
        }
    }
}

export default new AvaliacoesService();
