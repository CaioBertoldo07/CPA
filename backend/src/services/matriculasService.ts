import * as matriculasRepository from '../repositories/matriculasRepository';
import prisma from '../repositories/prismaClient';
import { AppError } from '../middleware/errorMiddleware';
import LyceumService from './lyceumService';
import respostasService from './respostasService';

const lyceumService = new LyceumService();

/** Normaliza nome de curso para casar respondentes (por nome) com snapshot (por nome). */
function normalizar(nome: string): string {
    return (nome || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');
}

/** Extrai ano/semestre de uma avaliacao (periodo_letivo pode ser "2024.1", "202401" etc). */
function periodoDaAvaliacao(avaliacao: { ano: string; periodo_letivo: string }): { ano: string; semestre?: string } {
    const ano = (avaliacao.ano || '').trim();
    const pl = (avaliacao.periodo_letivo || '').trim();
    const match = pl.match(/([12])\s*$/);
    return { ano, semestre: match ? match[1] : undefined };
}

class MatriculasService {
    /**
     * Busca matriculados no Lyceum e grava/atualiza o snapshot local.
     * `ano` obrigatorio; `semestre` opcional (recomendado).
     */
    async sincronizar(ano: string, semestre: string | undefined, universityToken: string) {
        if (!ano) throw new AppError('Parametro "ano" e obrigatorio.', 400);
        if (!universityToken) {
            throw new AppError('Sessão da universidade expirada. Faça login novamente para sincronizar.', 401);
        }

        const dados = await lyceumService.getMatriculados({ ano, ...(semestre ? { semestre } : {}) }, universityToken);

        const rows = dados
            .filter((d) => d.CURSO)
            .map((d) => ({
                ano: d.ANO ?? ano,
                semestre: d.SEMESTRE ?? semestre ?? '',
                und: d.UND ?? '',
                und_tipo: d.UND_TIPO ?? null,
                und_municipio: d.UND_MUNICIPIO ?? null,
                curso_codigo: d.CURSO,
                curso_nome: d.CURSO_NOME ?? '',
                curso_tipo: d.CURSO_TIPO ?? null,
                qt_matricula: Number.parseInt(d.QT_MATRICULA ?? '0', 10) || 0,
                fonte: 'LYCEUM',
            }));

        const gravados = await matriculasRepository.upsertMany(rows);

        return {
            ano,
            semestre: semestre ?? null,
            recebidos: dados.length,
            gravados,
            capturado_em: new Date(),
        };
    }

    /**
     * Taxa de participacao por curso para uma avaliacao:
     * respondentes (das respostas) / matriculados (do snapshot) * 100.
     * O periodo (ano/semestre) e derivado da propria avaliacao.
     */
    async getParticipacaoPorCurso(idAvaliacao: number) {
        const avaliacao = await prisma.avaliacao.findUnique({ where: { id: idAvaliacao } });
        if (!avaliacao) throw new AppError('Avaliacao nao encontrada.', 404);

        const { ano, semestre } = periodoDaAvaliacao(avaliacao);

        // Denominador: snapshot de matriculados agregado por curso (soma das unidades).
        const snapshot = await matriculasRepository.findByPeriodo(ano, semestre);
        const matriculadosPorCurso = new Map<string, { curso_nome: string; qt_matricula: number }>();
        for (const s of snapshot) {
            const key = normalizar(s.curso_nome);
            const atual = matriculadosPorCurso.get(key);
            if (atual) {
                atual.qt_matricula += s.qt_matricula;
            } else {
                matriculadosPorCurso.set(key, { curso_nome: s.curso_nome, qt_matricula: s.qt_matricula });
            }
        }

        // Numerador: respondentes unicos por curso (reusa o relatorio existente).
        const relatorio = await respostasService.getRespostasRelatorio(idAvaliacao);
        const respondentesPorCurso: Record<string, number> = relatorio.participacao?.curso ?? {};

        // Une as duas fontes (cursos que tem matriculados e/ou respostas).
        const chaves = new Set<string>([
            ...matriculadosPorCurso.keys(),
            ...Object.keys(respondentesPorCurso).map(normalizar),
        ]);

        // Mapa normalizado -> respondentes (caso o nome venha levemente diferente).
        const respNorm = new Map<string, { nome: string; total: number }>();
        for (const [nome, total] of Object.entries(respondentesPorCurso)) {
            respNorm.set(normalizar(nome), { nome, total: total as number });
        }

        const cursos = Array.from(chaves).map((key) => {
            const mat = matriculadosPorCurso.get(key);
            const resp = respNorm.get(key);
            const matriculados = mat?.qt_matricula ?? 0;
            const respondentes = resp?.total ?? 0;
            const participacao = matriculados > 0
                ? Number(((respondentes / matriculados) * 100).toFixed(2))
                : null; // sem denominador conhecido
            return {
                curso: mat?.curso_nome || resp?.nome || key,
                matriculados,
                respondentes,
                participacao,
            };
        }).sort((a, b) => b.respondentes - a.respondentes);

        const totalMatriculados = cursos.reduce((acc, c) => acc + c.matriculados, 0);
        const totalRespondentes = relatorio.totalAvaliadores ?? 0;

        return {
            idAvaliacao,
            ano,
            semestre: semestre ?? null,
            possuiSnapshot: snapshot.length > 0,
            totais: {
                matriculados: totalMatriculados,
                respondentes: totalRespondentes,
                participacao: totalMatriculados > 0
                    ? Number(((totalRespondentes / totalMatriculados) * 100).toFixed(2))
                    : null,
            },
            cursos,
        };
    }
}

export default new MatriculasService();
