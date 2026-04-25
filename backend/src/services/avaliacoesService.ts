import * as avaliacaoRepository from '../repositories/avaliacaoRepository';
import { AvaliacaoResponseDTO, CreateAvaliacaoDTO } from '../dtos/AvaliacaoDTO';
import { AppError } from '../middleware/errorMiddleware';
import { normalizeQuestaoIds } from '../utils/normalizeQuestaoIds';
import { UserResponseDTO } from '../dtos/AuthDTO';
import axios from 'axios';
import https from 'https';
import { hashMatricula } from '../utils/hashUtils';
import { env, isProduction } from '../config/env';
import { getUniversityToken } from './universityTokenStore';

const httpsAgent = new https.Agent({
    rejectUnauthorized: isProduction && !env.DISABLE_SSL_VALIDATION,
});

class AvaliacoesService {
    private normalizeCategoryText(value?: string): string {
        return (value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
    }

    private hasCategory(user: UserResponseDTO, category: 'DISCENTE' | 'DOCENTE' | 'TECNICO'): boolean {
        const categoria = this.normalizeCategoryText(user.categoria);
        const perfil = this.normalizeCategoryText(user.oberonPerfilNome);
        const lookup = category === 'TECNICO' ? 'TECNICO' : category;
        return categoria.includes(lookup) || perfil.includes(lookup);
    }

    private getCategoryFilters(categoria?: string): string[] {
        const normalized = this.normalizeCategoryText(categoria);
        const categories: string[] = [];

        if (normalized.includes('DISCENTE')) categories.push('DISCENTE');
        if (normalized.includes('DOCENTE')) categories.push('DOCENTE');
        if (normalized.includes('TECNICO')) categories.push('TÉCNICO');

        return categories;
    }

    private parsePeriodoLetivo(periodoLetivo: string): { ano: string; semestre: string } {
        const [ano, semestre] = (periodoLetivo || '').split('.');
        if (!ano || !semestre) {
            throw new AppError('Período letivo inválido para buscar disciplinas.', 400);
        }
        return { ano, semestre };
    }

    private normalizeMessageAsArray(message: any): any[] {
        if (Array.isArray(message)) return message;
        if (message && typeof message === 'object') return [message];
        return [];
    }

    private extractLyceumMessageRows(payload: any): any[] {
        // Suporta ambos os formatos:
        // 1) { message: [...] }
        // 2) [ { message: [...] } ]
        const topLevel = this.normalizeMessageAsArray(payload);
        const nested = topLevel.flatMap((entry: any) => this.normalizeMessageAsArray(entry?.message));
        if (nested.length > 0) return nested;

        const directMessage = this.normalizeMessageAsArray(payload?.message);
        if (directMessage.length > 0) return directMessage;

        // 3) [ {...linha de disciplina...}, {...} ]
        // Se não houver wrapper "message", usa o topo como linhas.
        return topLevel;
    }

    private hasValidDisciplina(item: any, perfil: 'DISCENTE' | 'DOCENTE'): boolean {
        if (!item || typeof item !== 'object') return false;

        // Evita gerar questões dinâmicas quando a API retorna payload genérico sem turma/disciplina.
        if (perfil === 'DOCENTE') {
            return Boolean(item.TUR_DISCIPLINA && String(item.TUR_DISCIPLINA).trim());
        }

        return Boolean(item.DISC_DISCIPLINA && String(item.DISC_DISCIPLINA).trim());
    }

    private dedupeDisciplinas(items: any[], perfil: 'DISCENTE' | 'DOCENTE'): any[] {
        const seen = new Set<string>();
        const result: any[] = [];

        for (const item of items) {
            const key = perfil === 'DOCENTE'
                ? String(item?.TUR_DISCIPLINA || '').trim()
                : String(item?.DISC_DISCIPLINA || '').trim();

            if (!key) continue;
            if (seen.has(key)) continue;

            seen.add(key);
            result.push(item);
        }

        return result;
    }

    private buildDisciplinaLabel(disciplina: any): { id: string; label: string } {
        const codigo = disciplina.DISC_DISCIPLINA || disciplina.TUR_DISCIPLINA || disciplina.CUR_CURSO || 'DISC';
        const nome = disciplina.DISC_NOME || disciplina.CUR_NOME || disciplina.TUR_TURMA || 'Disciplina';
        return {
            id: String(codigo),
            label: `${codigo} - ${nome}`,
        };
    }

    private hasDiscenteCategoriaSelecionada(categorias: Array<{ nome?: string }>): boolean {
        return categorias.some((categoria) => this.normalizeCategoryText(categoria?.nome) === 'DISCENTE');
    }

    private mapAvaliacao(avaliacao: any): AvaliacaoResponseDTO {
        return {
            ...avaliacao,
            titulo: `Avaliação CPA - ${avaliacao.periodo_letivo}`,
            questoes: (avaliacao.avaliacao_questoes || []).map((aq: any) => ({
                ...(aq.questoes || {}),
                id_avaliacao_questao: aq.id,
                disciplina: (aq as any).disciplina
            }))
        } as unknown as AvaliacaoResponseDTO;
    }

    async create(data: CreateAvaliacaoDTO): Promise<AvaliacaoResponseDTO> {
        const {
            unidade,
            cursos,
            categorias,
            modalidade,
            questoes: questoesInput,
            periodo_letivo,
            data_inicio,
            data_fim,
            status,
            ano,
        } = data;

        // Defensive normalization: prevent duplicated links of same questão in avaliação.
        const questoes = normalizeQuestaoIds(questoesInput as any[]);

        const cursosSelecionados = cursos || [];
        const modalidadesSelecionadas = modalidade || [];

        // Validações de existência via repositório
        const [uExist, catExist, qExist] = await Promise.all([
            avaliacaoRepository.validateUnidades(unidade),
            avaliacaoRepository.validateCategorias(categorias),
            avaliacaoRepository.validateQuestoes(questoes)
        ]);

        if (uExist.length !== unidade.length) throw new AppError('Uma ou mais unidades não encontradas.', 404);
        if (catExist.length !== categorias.length) throw new AppError('Uma ou mais categorias não encontrados.', 404);
        if (qExist.length !== questoes.length) throw new AppError('Uma ou mais questões não encontradas.', 404);

        const temCategoriaDiscente = this.hasDiscenteCategoriaSelecionada(catExist as Array<{ nome?: string }>);

        if (temCategoriaDiscente && modalidadesSelecionadas.length === 0) {
            throw new AppError('Selecione ao menos uma modalidade quando a categoria DISCENTE for selecionada.', 400);
        }

        if (modalidadesSelecionadas.length > 0) {
            const modExist = await avaliacaoRepository.validateModalidades(modalidadesSelecionadas);
            if (modExist.length !== modalidadesSelecionadas.length) throw new AppError('Uma ou mais modalidades não encontradas.', 404);
        }

        if (temCategoriaDiscente && cursosSelecionados.length === 0) {
            throw new AppError('Selecione ao menos um curso quando a categoria DISCENTE for selecionada.', 400);
        }

        if (cursosSelecionados.length > 0) {
            const cExist = await avaliacaoRepository.validateCursos(cursosSelecionados);
            if (cExist.length !== cursosSelecionados.length) throw new AppError('Um ou mais cursos não encontrados.', 404);
        }

        const avaliacao = await avaliacaoRepository.create({
            periodo_letivo,
            data_inicio: new Date(data_inicio),
            data_fim: new Date(data_fim),
            status,
            ano,
            unidade: { connect: unidade.map(id => ({ id })) },
            modalidades: { connect: modalidadesSelecionadas.map(id => ({ id })) },
            avaliacao_questoes: {
                create: questoes.map(questaoId => ({
                    questoes: { connect: { id: questaoId } },
                })),
            },
            cursos: { connect: cursosSelecionados.map(identificador => ({ identificador_api_lyceum: identificador })) },
            categorias: { connect: categorias.map(id => ({ id })) },
        });

        return this.mapAvaliacao(avaliacao);
    }

    async getAll(): Promise<AvaliacaoResponseDTO[]> {
        await avaliacaoRepository.ativarDisponiveis();
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
                case 'categorias': {
                    if (item.operator === 'isAnyOf') {
                        const vals = (Array.isArray(item.value) ? item.value : []).map(Number).filter((n: number) => !isNaN(n));
                        if (vals.length) conditions.push({ categorias: { some: { id: { in: vals } } } });
                    }
                    break;
                }
                case 'unidade': {
                    if (item.operator === 'isAnyOf') {
                        const vals = Array.isArray(item.value) ? (item.value as string[]) : [];
                        if (vals.length) conditions.push({ unidade: { some: { nome: { in: vals } } } });
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
        await avaliacaoRepository.ativarDisponiveis();
        await avaliacaoRepository.encerrarVencidas();
        const skip = page * limit;

        const andConditions: any[] = [];

        if (filters.status != null && !Number.isNaN(filters.status)) {
            andConditions.push({ status: filters.status });
        }

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

    async getDisponiveis(
        cursoUsuario: string | undefined,
        matricula: string,
        categoria?: string,
        unidade?: string,
        unidadeSigla?: string,
    ): Promise<AvaliacaoResponseDTO[]> {
        await avaliacaoRepository.ativarDisponiveis();
        const categoriaNormalizada = this.normalizeCategoryText(categoria);
        const isDiscente = categoriaNormalizada.includes('DISCENTE');
        const categoriaFilters = this.getCategoryFilters(categoria);

        if (isDiscente && !cursoUsuario) {
            throw new AppError('Curso do usuário não encontrado no token.', 400);
        }

        // Filtra sempre por categoria + unidade (nome ou sigla).
        // Para discente: também filtra por curso.
        // Não há fallbacks que ignorem unidade ou categoria — cada usuário só vê
        // avaliações da sua própria unidade e categoria.
        const avaliacoes = await avaliacaoRepository.findDisponiveis(
            cursoUsuario,
            new Date(),
            categoriaFilters,
            unidade,
            unidadeSigla,
        );

        if (avaliacoes.length === 0) return [];

        const avaliacaoIds = avaliacoes.map(a => a.id);
        const matriculaHash = hashMatricula(matricula);
        const respondidas = await avaliacaoRepository.findAvaliacoesRespondidasPeloAvaliador(matriculaHash, avaliacaoIds);
        const respondidasids = new Set(respondidas.map((r: any) => r.avaliacao_questao?.id_avaliacao).filter(Boolean));

        const avaliacoesNaoRespondidas = avaliacoes.filter((a: any) => !respondidasids.has(a.id));

        return avaliacoesNaoRespondidas.map((a: any) => this.mapAvaliacao(a));
    }

    async getById(id: number, user?: UserResponseDTO): Promise<AvaliacaoResponseDTO> {
        try {
            const avaliacao = await avaliacaoRepository.findById(id);
            if (!avaliacao) throw new AppError('Avaliação não encontrada.', 404);

            const shouldApplyDynamicDisciplinas = Boolean(user && !user.isAdmin);

            if (shouldApplyDynamicDisciplinas && user) {
                const { ano: anoAvaliacao, semestre: semestreAvaliacao } = this.parsePeriodoLetivo(avaliacao.periodo_letivo as string);
                const hasQuestoesDinamicas = ((avaliacao as any).avaliacao_questoes || [])
                    .some((aq: any) => Boolean(aq.questoes?.repetir_todas_disciplinas));

                let disciplinas: any[] = [];
                if (hasQuestoesDinamicas) {
                    const universityToken = user.email ? getUniversityToken(user.email) : undefined;
                    if (!universityToken) {
                        throw new AppError('Sessão da universidade expirada. Faça login novamente.', 401);
                    }

                    // Busca disciplinas estritamente no período da avaliação.
                    disciplinas = await this.getDisciplinasPorPerfil(anoAvaliacao, semestreAvaliacao, user, universityToken);
                }

                const novasQuestoes: any[] = [];
                const hasDisciplinas = disciplinas.length > 0;
                const seenDynamicKeys = new Set<string>();

                for (const aq of (avaliacao as any).avaliacao_questoes) {
                    if (aq.questoes?.repetir_todas_disciplinas) {
                        // Sem disciplinas no período, a questão dinâmica não deve aparecer.
                        if (!hasDisciplinas) {
                            continue;
                        }

                        for (const [idx, d] of disciplinas.entries()) {
                            const { id: discId, label: discLabel } = this.buildDisciplinaLabel(d);
                            const stableDiscId = String(discId || '').trim();
                            const dedupeKey = `${aq.questoes.id}::${stableDiscId}`;
                            if (seenDynamicKeys.has(dedupeKey)) {
                                continue;
                            }
                            seenDynamicKeys.add(dedupeKey);

                            const uniqueTag = `${discLabel}___${idx}`;

                            // Clona a questão sem alterar sua descrição
                            const questaoClone = {
                                ...aq.questoes,
                                id: `${aq.questoes.id}___${uniqueTag}` // ID virtual único para evitar colisão entre disciplinas repetidas
                            };

                            novasQuestoes.push({
                                ...aq,
                                id: `${aq.id}___${uniqueTag}`, // ID virtual único para o vínculo com o label completo
                                questoes: questaoClone,
                                disciplina: discLabel,
                                disciplina_id: discId,
                            });
                        }
                    } else {
                        novasQuestoes.push(aq);
                    }
                }
                (avaliacao as any).avaliacao_questoes = novasQuestoes;
            }

            return this.mapAvaliacao(avaliacao);
        } catch (error) {
            console.error('Erro ao processar avaliação:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Erro interno ao carregar avaliação.', 500);
        }
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

        const { unidade, cursos, categorias, modalidade, periodo_letivo, data_inicio, data_fim, ano } = data;
        const cursosSelecionados = cursos || [];
        const modalidadesSelecionadas = modalidade || [];
        // Defensive normalization: converts any virtual "numero___disciplina" IDs
        // that may have slipped through (keeps the contract: number[])
        const questoes = normalizeQuestaoIds(data.questoes);

        const [uExist, catExist, qExist] = await Promise.all([
            avaliacaoRepository.validateUnidades(unidade),
            avaliacaoRepository.validateCategorias(categorias),
            avaliacaoRepository.validateQuestoes(questoes)
        ]);

        if (uExist.length !== unidade.length) throw new AppError('Uma ou mais unidades não encontradas.', 404);
        if (catExist.length !== categorias.length) throw new AppError('Uma ou mais categorias não encontrados.', 404);
        if (qExist.length !== questoes.length) throw new AppError('Uma ou mais questões não encontradas.', 404);

        const temCategoriaDiscente = this.hasDiscenteCategoriaSelecionada(catExist as Array<{ nome?: string }>);

        if (temCategoriaDiscente && modalidadesSelecionadas.length === 0) {
            throw new AppError('Selecione ao menos uma modalidade quando a categoria DISCENTE for selecionada.', 400);
        }

        if (modalidadesSelecionadas.length > 0) {
            const modExist = await avaliacaoRepository.validateModalidades(modalidadesSelecionadas);
            if (modExist.length !== modalidadesSelecionadas.length) throw new AppError('Uma ou mais modalidades não encontradas.', 404);
        }

        if (temCategoriaDiscente && cursosSelecionados.length === 0) {
            throw new AppError('Selecione ao menos um curso quando a categoria DISCENTE for selecionada.', 400);
        }

        if (cursosSelecionados.length > 0) {
            const cExist = await avaliacaoRepository.validateCursos(cursosSelecionados);
            if (cExist.length !== cursosSelecionados.length) throw new AppError('Um ou mais cursos não encontrados.', 404);
        }

        const avaliacao = await avaliacaoRepository.update(id, {
            periodo_letivo,
            data_inicio: new Date(data_inicio),
            data_fim: new Date(data_fim),
            ano,
            unidade: { set: unidade.map(uid => ({ id: uid })) },
            modalidades: { set: modalidadesSelecionadas.map(mid => ({ id: mid })) },
            cursos: { set: cursosSelecionados.map(identificador => ({ identificador_api_lyceum: identificador })) },
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
        if (avaliacao.status !== 2 && avaliacao.status !== 3) throw new AppError('Apenas avaliações enviadas ou ativas podem ser prorrogadas.', 400);

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
        if (avaliacao.status !== 1) throw new AppError('Apenas rascunhos podem ser excluídos.', 400);

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
        if (!avaliacao.categorias?.length) erros.push('Nenhuma categoria vinculada.');
        const temCategoriaDiscente = this.hasDiscenteCategoriaSelecionada(avaliacao.categorias || []);
        if (temCategoriaDiscente && !avaliacao.modalidades?.length) {
            erros.push('Nenhuma modalidade vinculada para categoria DISCENTE.');
        }
        if (temCategoriaDiscente && !avaliacao.cursos?.length) {
            erros.push('Nenhum curso vinculado para categoria DISCENTE.');
        }
        if (!avaliacao.avaliacao_questoes?.length) erros.push('Nenhuma questão vinculada.');

        if (erros.length > 0) throw new AppError(`Avaliação incompleta: ${erros.join(' ')}`, 400);
    }

    private async getDisciplinasPorPerfil(ano: string, semestre: string, user: UserResponseDTO, token: string): Promise<any[]> {
        const hasDiscente = this.hasCategory(user, 'DISCENTE');
        const hasDocente = this.hasCategory(user, 'DOCENTE');
        const hasTecnico = this.hasCategory(user, 'TECNICO');

        if (hasDocente) {
            return this.getDisciplinasDocente(ano, semestre, user.cpf || '', token);
        }

        if (hasDiscente) {
            return this.getDisciplinasAluno(ano, semestre, token);
        }

        if (hasTecnico) {
            return [];
        }

        return [];
    }

    private async getDisciplinasAluno(ano: string, semestre: string, token: string): Promise<any[]> {
        // Usa homolog-api em desenvolvimento, igual ao endpoint do docente
        const apiHost = isProduction ? 'https://api.uea.edu.br' : 'https://homolog-api.uea.edu.br';
        const url = `${apiHost}/lyceum/cadu/aluno/historico/matriculapessoal/ano/${ano}/semestre/${semestre}`;
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                httpsAgent,
            });

            const parsedRows = this.extractLyceumMessageRows(response.data);
            const filteredRows = parsedRows.filter((item: any) => this.hasValidDisciplina(item, 'DISCENTE'));

            return this.dedupeDisciplinas(filteredRows, 'DISCENTE');
        } catch (error) {
            console.error('Erro API University (discente):', error);
            return [];
        }
    }

    private async getDisciplinasDocente(ano: string, semestre: string, cpf: string, token: string): Promise<any[]> {
        // URL: produção usa api.uea.edu.br, desenvolvimento/homolog usa homolog-api.uea.edu.br
        const apiHost = isProduction ? 'https://api.uea.edu.br' : 'https://homolog-api.uea.edu.br';
        const url = `${apiHost}/lyceum/docente/listar/turmas/cpfpessoal/ano/${ano}/semestre/${semestre}`;
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                httpsAgent,
            });

            const parsedRows = this.extractLyceumMessageRows(response.data);
            const filteredRows = parsedRows.filter((item: any) => this.hasValidDisciplina(item, 'DOCENTE'));

            return this.dedupeDisciplinas(filteredRows, 'DOCENTE');
        } catch (error) {
            console.error('Erro API University (docente):', error);
            return [];
        }
    }
}

export default new AvaliacoesService();
