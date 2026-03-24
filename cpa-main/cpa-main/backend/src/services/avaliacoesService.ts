import * as avaliacaoRepository from '../repositories/avaliacaoRepository';
import { AvaliacaoResponseDTO, CreateAvaliacaoDTO } from '../dtos/AvaliacaoDTO';
import { AppError } from '../middleware/errorMiddleware';
import { UserResponseDTO } from '../dtos/AuthDTO';
import axios from 'axios';
import https from 'https';
import { hashMatricula } from '../utils/hashUtils';

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
        await avaliacaoRepository.encerrarVencidas();
        const avaliacoes = await avaliacaoRepository.findMany();
        return avaliacoes.map((a: any) => this.mapAvaliacao(a));
    }

    private buildColumnFilters(items: any[]): any[] {
        const conditions: any[] = [];
        for (const item of items) {
            if (!item.field || !item.operator) continue;
            const emptyOp = item.operator === 'isEmpty' || item.operator === 'isNotEmpty';
            const hasValue = item.value !== undefined && item.value !== null && item.value !== '';
            if (!hasValue && !emptyOp) continue;

            switch (item.field) {
                case 'id': {
                    const id = parseInt(item.value, 10);
                    if (isNaN(id)) break;
                    if (item.operator === '=')  conditions.push({ id });
                    else if (item.operator === '!=') conditions.push({ NOT: { id } });
                    else if (item.operator === '>')  conditions.push({ id: { gt: id } });
                    else if (item.operator === '>=') conditions.push({ id: { gte: id } });
                    else if (item.operator === '<')  conditions.push({ id: { lt: id } });
                    else if (item.operator === '<=') conditions.push({ id: { lte: id } });
                    break;
                }
                case 'modalidades': {
                    const val = item.value as string;
                    const mode = 'insensitive' as const;
                    if (item.operator === 'isAnyOf') {
                        const vals = Array.isArray(item.value) ? item.value : [];
                        if (vals.length) conditions.push({ modalidades: { some: { mod_ensino: { in: vals } } } });
                    }
                    else if (item.operator === 'contains')   conditions.push({ modalidades: { some: { mod_ensino: { contains: val, mode } } } });
                    else if (item.operator === 'equals')     conditions.push({ modalidades: { some: { mod_ensino: { equals: val, mode } } } });
                    else if (item.operator === 'startsWith') conditions.push({ modalidades: { some: { mod_ensino: { startsWith: val, mode } } } });
                    else if (item.operator === 'endsWith')   conditions.push({ modalidades: { some: { mod_ensino: { endsWith: val, mode } } } });
                    else if (item.operator === 'isEmpty')    conditions.push({ modalidades: { none: {} } });
                    else if (item.operator === 'isNotEmpty') conditions.push({ modalidades: { some: {} } });
                    break;
                }
                case 'periodo_letivo':
                case 'ano': {
                    const f = item.field;
                    const val = item.value as string;
                    const mode = 'insensitive' as const;
                    if (item.operator === 'contains')        conditions.push({ [f]: { contains: val, mode } });
                    else if (item.operator === 'equals')     conditions.push({ [f]: val });
                    else if (item.operator === 'startsWith') conditions.push({ [f]: { startsWith: val, mode } });
                    else if (item.operator === 'endsWith')   conditions.push({ [f]: { endsWith: val, mode } });
                    else if (item.operator === 'isEmpty')    conditions.push({ [f]: null });
                    else if (item.operator === 'isNotEmpty') conditions.push({ NOT: { [f]: null } });
                    break;
                }
                case 'data_inicio':
                case 'data_fim': {
                    const f = item.field;
                    const date = new Date(item.value);
                    if (isNaN(date.getTime())) break;
                    const start = new Date(date); start.setHours(0, 0, 0, 0);
                    const end   = new Date(date); end.setHours(23, 59, 59, 999);
                    if (item.operator === 'is')          conditions.push({ [f]: { gte: start, lte: end } });
                    else if (item.operator === 'not')        conditions.push({ NOT: { [f]: { gte: start, lte: end } } });
                    else if (item.operator === 'after')      conditions.push({ [f]: { gt: end } });
                    else if (item.operator === 'onOrAfter')  conditions.push({ [f]: { gte: start } });
                    else if (item.operator === 'before')     conditions.push({ [f]: { lt: start } });
                    else if (item.operator === 'onOrBefore') conditions.push({ [f]: { lte: end } });
                    else if (item.operator === 'isEmpty')    conditions.push({ [f]: null });
                    else if (item.operator === 'isNotEmpty') conditions.push({ NOT: { [f]: null } });
                    break;
                }
                case 'status': {
                    if (item.operator === 'is') {
                        const val = parseInt(item.value, 10);
                        if (!isNaN(val)) conditions.push({ status: val });
                    } else if (item.operator === 'not') {
                        const val = parseInt(item.value, 10);
                        if (!isNaN(val)) conditions.push({ NOT: { status: val } });
                    } else if (item.operator === 'isAnyOf') {
                        const vals = (Array.isArray(item.value) ? item.value : []).map(Number).filter((n: number) => !isNaN(n));
                        if (vals.length) conditions.push({ status: { in: vals } });
                    }
                    break;
                }
            }
        }
        return conditions;
    }

    async getAllPaginated(
        page: number,
        limit: number,
        filters: { status?: number; search?: string; columnFilters?: any[] } = {}
    ): Promise<{
        data: AvaliacaoResponseDTO[];
        meta: { total: number; page: number; limit: number; totalPages: number };
    }> {
        await avaliacaoRepository.encerrarVencidas();
        const skip = page * limit;

        const andConditions: any[] = [];

        if (filters.status) andConditions.push({ status: filters.status });

        if (filters.search) {
            const q = filters.search.trim();
            const orClauses: any[] = [
                { periodo_letivo: { contains: q, mode: 'insensitive' } },
                { ano: { contains: q, mode: 'insensitive' } },
                { modalidades: { some: { mod_ensino: { contains: q, mode: 'insensitive' } } } },
            ];
            const idNum = parseInt(q, 10);
            if (!isNaN(idNum)) orClauses.push({ id: idNum });
            andConditions.push({ OR: orClauses });
        }

        const columnConditions = this.buildColumnFilters(filters.columnFilters || []);
        andConditions.push(...columnConditions);

        const where = andConditions.length ? { AND: andConditions } : undefined;

        const [avaliacoes, total] = await avaliacaoRepository.findManyPaginated(skip, limit, where);
        return {
            data: avaliacoes.map((a: any) => this.mapAvaliacao(a)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async getDisponiveis(cursoUsuario: string, matricula: string): Promise<AvaliacaoResponseDTO[]> {
        const avaliacoes = await avaliacaoRepository.findDisponiveis(cursoUsuario, new Date());

        if (avaliacoes.length === 0) return [];

        const avaliacaoIds = avaliacoes.map(a => a.id);
        const matriculaHash = hashMatricula(matricula);
        const respondidas = await avaliacaoRepository.findAvaliacoesRespondidasPeloAvaliador(matriculaHash, avaliacaoIds);
        const respondidasids = new Set(respondidas.map((r: any) => r.avaliacao_questao?.id_avaliacao).filter(Boolean));

        const avaliacoesNaoRespondidas = avaliacoes.filter((a: any) => !respondidasids.has(a.id));

        return avaliacoesNaoRespondidas.map((a: any) => this.mapAvaliacao(a));
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
        const matriculaHash = hashMatricula(matricula);
        const resposta = await avaliacaoRepository.findRespostaDoAvaliador(matriculaHash, idAvaliacao);
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
            if (new Date(avaliacao.data_fim) < new Date()) throw new AppError('Não é possível enviar uma avaliação com data de encerramento vencida.', 400);
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
