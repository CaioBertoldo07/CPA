import {
    createDoc,
    drawPageHeader,
    drawSectionTitle,
    drawKPIs,
    drawTable,
    drawText,
    finalizePDF,
    MARGIN,
    CONTENT_BOTTOM,
    C_GREEN,
    C_BLUE,
    C_RED,
    C_GRAY,
} from '../../services/pdfGeneratorService';

const fmtDate = (value) => {
    if (!value) return '—';
    const datePart = String(value).split('T')[0];
    const d = new Date(`${datePart}T00:00:00`);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
};

const statusLabel = (status) => {
    const map = {
        1: 'Rascunho',
        2: 'Enviada',
        3: 'Ativa',
        4: 'Encerrada',
    };
    return map[Number(status)] || '—';
};

const normalizeQuestionRows = (question) => {
    const baseRows = Object.entries(question.respostas || {}).map(([alternativa, info]) => {
        const absoluto = Number(info?.absoluto || 0);
        const porcentagem = Number(info?.porcentagem || 0);
        return [alternativa, absoluto, `${porcentagem.toFixed(2)}%`];
    });

    return baseRows.sort((a, b) => b[1] - a[1]);
};

export function buildAvaliacaoPDF({
    avaliacao,
    exportedAt,
    filename,
    filtros,
    totalAvaliadores = 0,
    totalQuestoes = 0,
    totalRespostas = 0,
    questoesRespondidas = 0,
    participacaoData = { unidade: [], curso: [], municipio: [] },
    rankingDisciplinas = [],
    questoes = [],
}) {
    const doc = createDoc();

    let y = drawPageHeader(
        doc,
        `Relatorio da Avaliacao #${avaliacao?.id ?? ''}`,
        `Periodo ${avaliacao?.periodo_letivo || '—'} · Ano ${avaliacao?.ano || '—'}`,
        exportedAt,
        filtros,
    );

    y = drawSectionTitle(doc, 'Resumo da avaliacao', y);
    y = drawTable(
        doc,
        ['Campo', 'Valor'],
        [
            ['ID', avaliacao?.id ?? '—'],
            ['Status', statusLabel(avaliacao?.status)],
            ['Periodo letivo', avaliacao?.periodo_letivo || '—'],
            ['Ano', avaliacao?.ano || '—'],
            ['Inicio', fmtDate(avaliacao?.data_inicio)],
            ['Fim', fmtDate(avaliacao?.data_fim)],
            ['Modalidades', (avaliacao?.modalidades || []).map(m => m.mod_ensino).join(', ') || '—'],
            ['Unidades', (avaliacao?.unidade || []).map(u => u.sigla || u.nome).join(', ') || '—'],
            ['Categorias', (avaliacao?.categorias || []).map(c => c.nome).join(', ') || '—'],
        ],
        y,
    );

    y = drawSectionTitle(doc, 'Indicadores principais', y);
    y = drawKPIs(doc, [
        { label: 'Total de avaliadores', value: totalAvaliadores, color: C_GREEN },
        { label: 'Total de questoes', value: totalQuestoes, color: C_BLUE },
        { label: 'Questoes respondidas', value: questoesRespondidas, color: C_RED },
        { label: 'Respostas consolidadas', value: totalRespostas, color: C_GRAY },
    ], y);

    const recortes = [
        { key: 'unidade', title: 'Participacao por unidade' },
        { key: 'curso', title: 'Participacao por curso' },
        { key: 'municipio', title: 'Participacao por municipio' },
    ];

    for (const recorte of recortes) {
        const data = (participacaoData[recorte.key] || []).slice(0, 15);
        if (data.length === 0) continue;

        if (y > CONTENT_BOTTOM - 35) {
            doc.addPage();
            y = MARGIN + 6;
        }

        y = drawSectionTitle(doc, recorte.title, y);
        y = drawTable(
            doc,
            ['Nome', 'Respondentes'],
            data.map(item => [item.name, item.value]),
            y,
            { columnStyles: { 1: { halign: 'center', cellWidth: 30 } } },
        );
    }

    if (rankingDisciplinas.length > 0) {
        if (y > CONTENT_BOTTOM - 35) {
            doc.addPage();
            y = MARGIN + 6;
        }

        y = drawSectionTitle(doc, 'Ranking por disciplina', y);
        y = drawTable(
            doc,
            ['Posicao', 'Disciplina', 'Respostas', 'Pontuacao'],
            rankingDisciplinas.map((item, idx) => [
                idx + 1,
                item.name,
                item.total,
                `${Number(item.score || 0).toFixed(1)}%`,
            ]),
            y,
            {
                columnStyles: {
                    0: { halign: 'center', cellWidth: 20 },
                    2: { halign: 'center', cellWidth: 26 },
                    3: { halign: 'right', cellWidth: 28 },
                },
            },
        );
    }

    if (questoes.length > 0) {
        if (y > CONTENT_BOTTOM - 30) {
            doc.addPage();
            y = MARGIN + 6;
        }

        y = drawSectionTitle(doc, 'Resultado por questao', y);

        for (let i = 0; i < questoes.length; i++) {
            const q = questoes[i];
            const rows = normalizeQuestionRows(q);

            if (y > CONTENT_BOTTOM - 45) {
                doc.addPage();
                y = MARGIN + 6;
            }

            y = drawText(doc, `${i + 1}. ${q.descricao || 'Questao sem descricao'}`, y, {
                bold: true,
                fontSize: 9,
            });

            y = drawText(
                doc,
                `Dimensao: ${q.dimensao || '—'} · Tipo: ${(q.tipo || 'padrao').toString().toUpperCase()} · Total: ${q.total || 0}`,
                y,
                { fontSize: 8, color: [100, 116, 139] },
            );

            if (rows.length === 0) {
                y = drawText(doc, 'Sem respostas registradas para esta questao.', y, {
                    fontSize: 8,
                    color: [148, 163, 184],
                });
                y += 2;
                continue;
            }

            y = drawTable(
                doc,
                ['Alternativa', 'Total', 'Percentual'],
                rows,
                y,
                {
                    columnStyles: {
                        1: { halign: 'center', cellWidth: 24 },
                        2: { halign: 'right', cellWidth: 28 },
                    },
                },
            );
        }
    }

    finalizePDF(doc, filename);
}
