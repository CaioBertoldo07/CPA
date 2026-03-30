/**
 * DashboardPDFBuilder.js
 * Builds the Dashboard Geral PDF from Relatorios.jsx data.
 * Fully data-driven — no DOM capture.
 */

import {
    createDoc,
    drawPageHeader,
    drawSectionTitle,
    drawKPIs,
    drawTable,
    drawBarChart,
    finalizePDF,
    C_GREEN, C_BLUE, C_RED, C_GRAY,
    CONTENT_BOTTOM,
    MARGIN,
} from '../../services/pdfGeneratorService';

const STATUS_COLORS = {
    Rascunho:  C_GRAY,
    Enviada:   C_BLUE,
    Ativa:     [34, 197, 94],
    Encerrada: C_RED,
};

/**
 * @param {object} params
 * @param {Array}  params.avaliacoes      — raw array from useGetAvaliacoesQuery
 * @param {Array}  params.categoriasData  — from useGetDashboardCategoriasQuery
 * @param {string} params.exportedAt      — formatted datetime string
 * @param {string} params.filename        — without extension
 */
export function buildDashboardPDF({ avaliacoes, categoriasData, exportedAt, filename }) {
    const doc = createDoc();

    // ── Computed metrics ──────────────────────────────────────────
    const total      = avaliacoes.length;
    const rascunhos  = avaliacoes.filter(a => a.status === 1).length;
    const enviadas   = avaliacoes.filter(a => a.status === 2).length;
    const ativas     = avaliacoes.filter(a => a.status === 3).length;
    const encerradas = avaliacoes.filter(a => a.status === 4).length;
    const progressPct = total > 0 ? Math.round((encerradas / total) * 100) : 0;

    // Avaliações por ano
    const anoCounts = {};
    avaliacoes.forEach(av => {
        const yr = av.ano || 'N/A';
        anoCounts[yr] = (anoCounts[yr] || 0) + 1;
    });
    const anoData = Object.entries(anoCounts)
        .map(([ano, qty]) => ({ name: ano, value: qty }))
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    // Avaliações por modalidade
    const modalCounts = {};
    avaliacoes.forEach(av => {
        (av.modalidades || []).forEach(m => {
            const nm = m.mod_ensino || 'Desconhecida';
            modalCounts[nm] = (modalCounts[nm] || 0) + 1;
        });
    });
    const modalData = Object.entries(modalCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    // ── Page 1 ────────────────────────────────────────────────────
    let y = drawPageHeader(
        doc,
        'Dashboard Geral',
        'Acompanhamento de avaliações institucionais',
        exportedAt,
        null,
    );

    // KPIs
    y = drawSectionTitle(doc, 'Métricas Gerais', y);
    y = drawKPIs(doc, [
        { label: 'Total de Avaliações', value: total,      color: C_GREEN },
        { label: 'Enviadas',            value: enviadas,   color: C_BLUE  },
        { label: 'Ativas',              value: ativas,     color: [34, 197, 94] },
        { label: 'Encerradas',          value: encerradas, color: C_RED   },
        { label: 'Rascunhos',           value: rascunhos,  color: C_GRAY  },
    ], y);

    // Taxa de conclusão (inline KPI)
    y = drawSectionTitle(doc, 'Taxa de Conclusão', y);
    y = drawKPIs(doc, [
        { label: 'Avaliações Encerradas', value: `${progressPct}%`, color: C_RED   },
        { label: 'Encerradas / Total',    value: `${encerradas} / ${total}`, color: C_GREEN },
    ], y);

    // Distribuição por Status — tabela
    y = drawSectionTitle(doc, 'Distribuição por Status', y);
    const statusRows = [
        ['Rascunho',  rascunhos,  total > 0 ? `${((rascunhos/total)*100).toFixed(1)}%`  : '0%'],
        ['Enviada',   enviadas,   total > 0 ? `${((enviadas/total)*100).toFixed(1)}%`   : '0%'],
        ['Ativa',     ativas,     total > 0 ? `${((ativas/total)*100).toFixed(1)}%`     : '0%'],
        ['Encerrada', encerradas, total > 0 ? `${((encerradas/total)*100).toFixed(1)}%` : '0%'],
    ];
    y = drawTable(doc,
        ['Status', 'Quantidade', 'Percentual'],
        statusRows, y,
        {
            columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
            didParseCell: (data) => {
                if (data.section === 'body') {
                    const statusName = data.row.raw[0];
                    const color = STATUS_COLORS[statusName];
                    if (color && data.column.index === 0) {
                        data.cell.styles.textColor = color;
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            },
        }
    );

    // Avaliações por Ano
    if (anoData.length > 0) {
        y = drawSectionTitle(doc, 'Avaliações por Ano', y);
        y = drawTable(doc,
            ['Ano', 'Quantidade'],
            anoData.map(d => [d.name, d.value]), y,
            { columnStyles: { 1: { halign: 'center' } } }
        );
    }

    // Avaliações por Modalidade — bar chart + table
    if (modalData.length > 0) {
        // page break if needed
        if (y > CONTENT_BOTTOM - 60) { doc.addPage(); y = MARGIN + 6; }
        y = drawSectionTitle(doc, 'Avaliações por Modalidade de Ensino', y);
        y = drawBarChart(doc, modalData, y, { color: C_GREEN, labelW: 70 });
        y = drawTable(doc,
            ['Modalidade', 'Quantidade'],
            modalData.map(d => [d.name, d.value]), y,
            { columnStyles: { 1: { halign: 'center' } } }
        );
    }

    // Respondentes por Categoria
    const catFiltered = (Array.isArray(categoriasData) ? categoriasData : [])
        .filter(c => c.respondentes > 0);
    if (catFiltered.length > 0) {
        if (y > CONTENT_BOTTOM - 50) { doc.addPage(); y = MARGIN + 6; }
        y = drawSectionTitle(doc, 'Respondentes por Categoria de Avaliador', y);
        y = drawBarChart(doc,
            catFiltered.map(c => ({ name: c.categoria, value: c.respondentes })),
            y,
            { color: [124, 58, 237], labelW: 60 }
        );
        y = drawTable(doc,
            ['Categoria', 'Respondentes'],
            catFiltered.map(c => [c.categoria, c.respondentes]), y,
            { columnStyles: { 1: { halign: 'center' } } }
        );
    }

    // Lista completa de avaliações
    if (avaliacoes.length > 0) {
        if (y > CONTENT_BOTTOM - 30) { doc.addPage(); y = MARGIN + 6; }
        const STATUS_LABELS = { 1: 'Rascunho', 2: 'Enviada', 3: 'Ativa', 4: 'Encerrada' };
        y = drawSectionTitle(doc, `Lista de Avaliações (${avaliacoes.length})`, y);
        const avalRows = avaliacoes.map(av => [
            av.id ?? '—',
            av.titulo || av.periodo_letivo || '—',
            av.periodo_letivo || '—',
            av.ano || '—',
            STATUS_LABELS[av.status] || '—',
        ]);
        drawTable(doc,
            ['ID', 'Título / Período', 'Período Letivo', 'Ano', 'Status'],
            avalRows, y,
            {
                columnStyles: {
                    0: { cellWidth: 14, halign: 'center' },
                    3: { cellWidth: 18, halign: 'center' },
                    4: { cellWidth: 24, halign: 'center' },
                },
            }
        );
    }

    finalizePDF(doc, filename);
}
