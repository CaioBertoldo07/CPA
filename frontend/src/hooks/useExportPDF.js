import { useState, useCallback } from 'react';

/**
 * useExportPDF — Hook genérico para exportar um elemento HTML como PDF.
 *
 * Uso:
 *   const { isExporting, exportToPDF } = useExportPDF();
 *   await exportToPDF('meu-elemento-id', 'nome-do-arquivo', { orientation: 'portrait', margin: 12 });
 *
 * @returns {{ isExporting: boolean, exportToPDF: function }}
 *
 * exportToPDF(elementId, filename, options)
 *   @param {string} elementId  - ID do elemento HTML a capturar (sem #)
 *   @param {string} filename   - Nome do arquivo sem extensão (ex: "CPA_Dashboard_20240101")
 *   @param {object} [options]
 *     @param {'auto'|'portrait'|'landscape'} [options.orientation='auto']
 *         'auto' escolhe landsca quando largura > 75% da altura
 *     @param {number} [options.margin=15]  - Margem em mm (todas as bordas)
 *     @param {number} [options.scale=2]    - Escala de captura (2 = 2x resolução; qualidade superior)
 *   @returns {Promise<void>}
 */
const useExportPDF = () => {
    const [isExporting, setIsExporting] = useState(false);

    const exportToPDF = useCallback(async (elementId, filename, options = {}) => {
        setIsExporting(true);
        try {
            // Importação dinâmica — não aumenta o bundle inicial
            const [html2canvasModule, jsPDFModule] = await Promise.all([
                import('html2canvas'),
                import('jspdf'),
            ]);
            const html2canvas = html2canvasModule.default;
            const { jsPDF } = jsPDFModule;

            const element = document.getElementById(elementId);
            if (!element) throw new Error(`Elemento com id "${elementId}" não encontrado no DOM.`);

            const { orientation = 'auto', margin = 15, scale = 2 } = options;

            // Captura o elemento como canvas, desabilitando animações no clone
            const canvas = await html2canvas(element, {
                scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 0,
                onclone: (_doc, clonedEl) => {
                    // Remove animações e transições para captura limpa
                    const style = _doc.createElement('style');
                    style.textContent = '* { animation: none !important; transition: none !important; }';
                    _doc.head.appendChild(style);
                    // Garante fundo branco no elemento raiz
                    clonedEl.style.background = '#ffffff';
                },
            });

            const imgData = canvas.toDataURL('image/png');
            const canvasW = canvas.width;
            const canvasH = canvas.height;

            // Determina orientação
            const useLandscape =
                orientation === 'landscape' ||
                (orientation === 'auto' && canvasW > canvasH * 0.75);

            const pdf = new jsPDF({
                orientation: useLandscape ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const FOOTER_H = 10; // mm reservados para rodapé
            const contentAreaW = pageW - margin * 2;
            const contentAreaH = pageH - margin * 2 - FOOTER_H;

            // Escala a imagem para ocupar toda a largura disponível
            const imgW = contentAreaW;
            const imgH = imgW * (canvasH / canvasW);

            const totalPages = Math.max(1, Math.ceil(imgH / contentAreaH));

            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR');
            const timeStr = now.toLocaleTimeString('pt-BR');

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();

                // Posiciona a imagem de forma que cada página mostre a fatia correta
                const yOffset = margin - page * contentAreaH;
                pdf.addImage(imgData, 'PNG', margin, yOffset, imgW, imgH);

                // Linha separadora do rodapé
                pdf.setDrawColor(226, 232, 240);
                pdf.setLineWidth(0.3);
                pdf.line(margin, pageH - FOOTER_H, pageW - margin, pageH - FOOTER_H);

                // Texto do rodapé
                pdf.setFontSize(7.5);
                pdf.setTextColor(113, 128, 150);
                pdf.text(
                    `CPA UEA — Exportado em ${dateStr} às ${timeStr}`,
                    margin,
                    pageH - FOOTER_H + 4,
                );
                pdf.text(
                    `Página ${page + 1} de ${totalPages}`,
                    pageW - margin,
                    pageH - FOOTER_H + 4,
                    { align: 'right' },
                );
            }

            pdf.save(`${filename}.pdf`);
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { isExporting, exportToPDF };
};

export default useExportPDF;
