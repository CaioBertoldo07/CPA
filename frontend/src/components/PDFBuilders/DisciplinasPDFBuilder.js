import {
    createDoc,
    drawPageHeader,
    drawSectionTitle,
    drawKPIs,
    drawTable,
    finalizePDF,
    drawText,
    MARGIN,
    CONTENT_BOTTOM,
    C_GREEN,
    C_BLUE,
    C_RED,
} from '../../services/pdfGeneratorService';

const fmtDate = (value) => {
    if (!value) return '—';
    const datePart = String(value).split('T')[0];
    const d = new Date(`${datePart}T00:00:00`);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
};

const scoreColor = (score) => {
    if (score >= 70) return [22, 101, 52];
    if (score >= 50) return [180, 83, 9];
    return [185, 28, 28];
};

export function buildDisciplinasPDF({
    avaliacao,
    exportedAt,
    filename,
    filtros,
    selectedQuestionLabel,
    processedRanking = [],
    topItems = [],
    bottomItems = [],
    rankingData = [],
}) {
    const doc = createDoc();

    let y = drawPageHeader(
        doc,
        `Ranking por Disciplina — Avaliacao #${avaliacao?.id ?? ''}`,
        `Periodo ${avaliacao?.periodo_letivo || '—'} · Ano ${avaliacao?.ano || '—'}`,
        exportedAt,
        filtros,
    );

    y = drawSectionTitle(doc, 'Resumo da avaliacao', y);
    y = drawTable(
        doc,
        ['Campo', 'Valor'],
        [
            ['Avaliacao', `#${avaliacao?.id ?? '—'}`],
            ['Periodo letivo', avaliacao?.periodo_letivo || '—'],
            ['Ano', avaliacao?.ano || '—'],
            ['Inicio', fmtDate(avaliacao?.data_inicio)],
            ['Fim', fmtDate(avaliacao?.data_fim)],
            ['Filtro de pergunta', selectedQuestionLabel || 'Pontuacao geral (media)'],
        ],
        y,
    );

    y = drawSectionTitle(doc, 'Indicadores de ranking', y);
    y = drawKPIs(
        doc,
        [
            { label: 'Disciplinas no ranking', value: processedRanking.length, color: C_GREEN },
            { label: 'Melhor pontuacao', value: topItems[0] ? `${Number(topItems[0].score || 0).toFixed(1)}%` : '0%', color: C_BLUE },
            { label: 'Menor pontuacao', value: bottomItems[0] ? `${Number(bottomItems[0].score || 0).toFixed(1)}%` : '0%', color: C_RED },
        ],
        y,
    );

    if (topItems.length > 0) {
        y = drawSectionTitle(doc, 'Top 10 disciplinas', y);
        y = drawTable(
            doc,
            ['Posicao', 'Disciplina', 'Respostas', 'Pontuacao'],
            topItems.map((item, idx) => [
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
                    3: { halign: 'right', cellWidth: 30 },
                },
            },
        );
    }

    if (bottomItems.length > 0) {
        if (y > CONTENT_BOTTOM - 35) {
            doc.addPage();
            y = MARGIN + 6;
        }

        y = drawSectionTitle(doc, 'Disciplinas com menor pontuacao', y);
        y = drawTable(
            doc,
            ['Posicao', 'Disciplina', 'Respostas', 'Pontuacao'],
            bottomItems.map((item, idx) => {
                const pos = Math.max(1, processedRanking.length - bottomItems.length + idx + 1);
                return [
                    pos,
                    item.name,
                    item.total,
                    `${Number(item.score || 0).toFixed(1)}%`,
                ];
            }),
            y,
            {
                columnStyles: {
                    0: { halign: 'center', cellWidth: 20 },
                    2: { halign: 'center', cellWidth: 26 },
                    3: { halign: 'right', cellWidth: 30 },
                },
            },
        );
    }

    if (processedRanking.length > 0) {
        if (y > CONTENT_BOTTOM - 35) {
            doc.addPage();
            y = MARGIN + 6;
        }

        y = drawSectionTitle(doc, 'Tabela completa de ranking', y);
        y = drawTable(
            doc,
            ['Posicao', 'Disciplina', 'Respostas', 'Pontuacao'],
            processedRanking.map((item, idx) => [
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
                    3: { halign: 'right', cellWidth: 30 },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 3) {
                        const raw = String(data.row.raw[3]).replace('%', '').replace(',', '.');
                        const score = Number(raw);
                        data.cell.styles.textColor = scoreColor(score);
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
            },
        );
    }

    if (Array.isArray(rankingData) && rankingData.length > 0) {
        if (y > CONTENT_BOTTOM - 25) {
            doc.addPage();
            y = MARGIN + 6;
        }

        y = drawSectionTitle(doc, 'Detalhamento por pergunta (top 5)', y);

        const questoes = rankingData[0]?.questoes || [];
        for (let qIdx = 0; qIdx < questoes.length; qIdx++) {
            const q = questoes[qIdx];

            const rankingQuestao = rankingData
                .map(d => {
                    const r = (d.questoes || []).find(rq => rq.id_avaliacao_questoes === q.id_avaliacao_questoes);
                    return {
                        disciplina: d.disciplina,
                        total: r?.total || 0,
                        score: r?.score || 0,
                    };
                })
                .filter(d => d.total > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            if (rankingQuestao.length === 0) {
                continue;
            }

            if (y > CONTENT_BOTTOM - 38) {
                doc.addPage();
                y = MARGIN + 6;
            }

            y = drawText(doc, `${qIdx + 1}. ${q.descricao || 'Pergunta sem descricao'}`, y, {
                bold: true,
                fontSize: 9,
            });

            y = drawTable(
                doc,
                ['Rank', 'Disciplina', 'Respostas', 'Pontuacao'],
                rankingQuestao.map((item, idx) => [
                    idx + 1,
                    item.disciplina,
                    item.total,
                    `${Number(item.score || 0).toFixed(1)}%`,
                ]),
                y,
                {
                    columnStyles: {
                        0: { halign: 'center', cellWidth: 16 },
                        2: { halign: 'center', cellWidth: 24 },
                        3: { halign: 'right', cellWidth: 28 },
                    },
                },
            );
        }
    }

    finalizePDF(doc, filename);
}
