/**
 * pdfGeneratorService.js
 * Low-level PDF primitives: layout constants, page header/footer,
 * section titles, KPI boxes, tables and horizontal bar charts.
 * Uses jsPDF + jspdf-autotable (functional API).
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── Layout constants ─────────────────────────────────────────── */
export const MARGIN = 14;          // mm, all sides
export const PAGE_W = 210;         // A4 portrait width
export const PAGE_H = 297;         // A4 portrait height
export const CONTENT_W = PAGE_W - MARGIN * 2;  // 182 mm usable width
export const FOOTER_H = 10;        // mm reserved at bottom for footer
export const CONTENT_BOTTOM = PAGE_H - MARGIN - FOOTER_H; // y limit before footer

/* ─── Brand palette ────────────────────────────────────────────── */
export const C_GREEN  = [46, 125, 50];   // #2e7d32
export const C_BLUE   = [59, 130, 246];  // #3b82f6
export const C_RED    = [239, 68, 68];   // #ef4444
export const C_GRAY   = [148, 163, 184]; // #94a3b8
export const C_TEXT   = [26, 32, 44];    // #1a202c — primary text
export const C_MUTED  = [113, 128, 150]; // #718096 — secondary text
export const C_BORDER = [226, 232, 240]; // #e2e8f0

/* ─── Factory ──────────────────────────────────────────────────── */
export function createDoc() {
    return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

/* ─── Page header (first page) ─────────────────────────────────── */
/**
 * Draws the branded header block and returns the next Y cursor.
 * @param {jsPDF} doc
 * @param {string} title
 * @param {string} subtitle
 * @param {string} exportedAt  — formatted datetime string
 * @param {object|null} filters — { unidade, curso, municipio }
 * @returns {number} next Y position
 */
export function drawPageHeader(doc, title, subtitle, exportedAt, filters) {
    // Top green accent bar
    doc.setFillColor(...C_GREEN);
    doc.rect(0, 0, PAGE_W, 4, 'F');

    // Org name (left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C_GREEN);
    doc.text('CPA — Comissão Própria de Avaliação | UEA', MARGIN, 12);

    // Exported-at (right)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C_MUTED);
    doc.text(`Exportado: ${exportedAt}`, PAGE_W - MARGIN, 12, { align: 'right' });

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(...C_TEXT);
    doc.text(title, MARGIN, 23);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...C_MUTED);
    doc.text(subtitle, MARGIN, 30);

    let y = 36;

    // Active filters row
    if (filters) {
        const parts = [];
        if (filters.unidade)   parts.push(`Unidade: ${filters.unidade}`);
        if (filters.curso)     parts.push(`Curso: ${filters.curso}`);
        if (filters.municipio) parts.push(`Município: ${filters.municipio}`);
        if (parts.length) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`Filtros ativos: ${parts.join(' · ')}`, MARGIN, y);
            y += 5;
        }
    }

    // Divider
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);

    return y + 7;
}

/* ─── Per-page footer ──────────────────────────────────────────── */
export function drawFooter(doc, pageNum, totalPages) {
    const y = PAGE_H - 7;
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - FOOTER_H, PAGE_W - MARGIN, PAGE_H - FOOTER_H);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text('CPA UEA — Comissão Própria de Avaliação', MARGIN, y);
    doc.text(`Página ${pageNum} de ${totalPages}`, PAGE_W - MARGIN, y, { align: 'right' });
}

/* ─── Section title bar ────────────────────────────────────────── */
/**
 * Draws a green-tinted section header and returns next Y.
 */
export function drawSectionTitle(doc, title, y) {
    doc.setFillColor(232, 245, 233); // #e8f5e9
    doc.setDrawColor(187, 222, 193);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, CONTENT_W, 8, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C_GREEN);
    doc.text(title.toUpperCase(), MARGIN + 4, y + 5.4);

    return y + 13;
}

/* ─── KPI boxes row ────────────────────────────────────────────── */
/**
 * Draws a horizontal row of metric boxes.
 * @param {jsPDF} doc
 * @param {Array<{label:string, value:string|number, color?:number[]}>} kpis
 * @param {number} y
 * @returns {number} next Y
 */
export function drawKPIs(doc, kpis, y) {
    const boxW = CONTENT_W / kpis.length;
    const boxH = 22;

    kpis.forEach((kpi, i) => {
        const x = MARGIN + i * boxW;
        const color = kpi.color || C_GREEN;

        // Card background
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(x + 0.8, y, boxW - 1.6, boxH, 2, 2, 'FD');

        // Accent top bar (3px)
        doc.setFillColor(...color);
        doc.rect(x + 0.8, y, boxW - 1.6, 2.5, 'F');

        // Value
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...C_TEXT);
        doc.text(String(kpi.value ?? 0), x + boxW / 2, y + 13, { align: 'center' });

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...C_MUTED);
        const labelLines = doc.splitTextToSize(kpi.label, boxW - 4);
        doc.text(labelLines, x + boxW / 2, y + 18.5, { align: 'center' });
    });

    return y + boxH + 8;
}

/* ─── Auto-paginated table ─────────────────────────────────────── */
/**
 * Draws a table using jspdf-autotable and returns the Y after the table.
 * @param {jsPDF} doc
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 * @param {number} y  — startY
 * @param {object} [opts]  — passed into autoTable
 * @returns {number} next Y
 */
export function drawTable(doc, headers, rows, y, opts = {}) {
    const { columnStyles, didParseCell, marginLeft, ...rest } = opts;

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: y,
        margin: { left: marginLeft ?? MARGIN, right: MARGIN },
        styles: {
            fontSize: 8,
            cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
            lineColor: C_BORDER,
            lineWidth: 0.25,
            textColor: C_TEXT,
            font: 'helvetica',
            overflow: 'linebreak',
        },
        headStyles: {
            fillColor: C_GREEN,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'left',
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        theme: 'grid',
        columnStyles,
        didParseCell,
        ...rest,
    });

    return (doc.lastAutoTable?.finalY ?? y) + 8;
}

/* ─── Simple horizontal bar chart ──────────────────────────────── */
/**
 * Draws a horizontal bar chart using primitive rectangles.
 * @param {jsPDF} doc
 * @param {Array<{name:string, value:number}>} data
 * @param {number} y
 * @param {object} [opts]
 * @returns {number} next Y
 */
export function drawBarChart(doc, data, y, opts = {}) {
    const {
        labelW = 55,
        barH = 5.5,
        gap = 4,
        color = C_GREEN,
        valueFormat = (v) => String(v),
    } = opts;

    if (!data?.length) return y;

    const barMaxW = CONTENT_W - labelW - 18;
    const maxVal = Math.max(...data.map(d => d.value ?? 0), 1);

    data.forEach(item => {
        const val = item.value ?? 0;
        const barW = Math.max((val / maxVal) * barMaxW, 0);
        const x = MARGIN;

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...C_TEXT);
        const label = doc.splitTextToSize(String(item.name ?? ''), labelW - 2);
        doc.text(label[0], x, y + barH / 2 + 2);

        // Bar track
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(x + labelW, y, barMaxW, barH, 1, 1, 'F');

        // Bar fill
        if (barW > 0) {
            doc.setFillColor(...color);
            doc.roundedRect(x + labelW, y, barW, barH, 1, 1, 'F');
        }

        // Value text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...C_TEXT);
        doc.text(valueFormat(val), x + labelW + barMaxW + 3, y + barH / 2 + 2);

        y += barH + gap;
    });

    return y + 4;
}

/* ─── Inline text block ────────────────────────────────────────── */
/**
 * Draws a wrapped text block and returns next Y.
 */
export function drawText(doc, text, y, opts = {}) {
    const { fontSize = 8.5, color = C_TEXT, bold = false, indent = 0 } = opts;
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_W - indent);
    doc.text(lines, MARGIN + indent, y);
    return y + lines.length * (fontSize * 0.4) + 2;
}

/* ─── Finalize: add footers to all pages, save ─────────────────── */
export function finalizePDF(doc, filename) {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        drawFooter(doc, i, total);
    }
    doc.save(`${filename}.pdf`);
}
