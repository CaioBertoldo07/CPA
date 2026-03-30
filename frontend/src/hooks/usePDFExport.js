import { useCallback, useState } from 'react';
import { buildDashboardPDF } from '../components/PDFBuilders/DashboardPDFBuilder';
import { buildAvaliacaoPDF } from '../components/PDFBuilders/AvaliacaoPDFBuilder';

const buildExportTimestamp = () => {
    const now = new Date();
    const exportedAt = now.toLocaleString('pt-BR');
    const datePart = now.toLocaleDateString('pt-BR').replace(/\//g, '');
    const timePart = now.toLocaleTimeString('pt-BR').replace(/:/g, '').replace(/\s/g, '');

    return { exportedAt, datePart, timePart };
};

const usePDFExport = () => {
    const [isExporting, setIsExporting] = useState(false);

    const exportDashboardReport = useCallback(async ({ avaliacoes = [], categoriasData = [] }) => {
        setIsExporting(true);
        try {
            const { exportedAt, datePart, timePart } = buildExportTimestamp();
            const filename = `CPA_Dashboard_${datePart}_${timePart}`;

            buildDashboardPDF({
                avaliacoes,
                categoriasData,
                exportedAt,
                filename,
            });
        } finally {
            setIsExporting(false);
        }
    }, []);

    const exportAvaliacaoReport = useCallback(async ({
        avaliacao,
        filtros,
        totalAvaliadores,
        totalQuestoes,
        totalRespostas,
        questoesRespondidas,
        participacaoData,
        rankingDisciplinas,
        questoes,
    }) => {
        setIsExporting(true);
        try {
            const { exportedAt, datePart, timePart } = buildExportTimestamp();
            const filename = `CPA_RelatorioAvaliacao_${avaliacao?.id || 'NA'}_${datePart}_${timePart}`;

            buildAvaliacaoPDF({
                avaliacao,
                exportedAt,
                filename,
                filtros,
                totalAvaliadores,
                totalQuestoes,
                totalRespostas,
                questoesRespondidas,
                participacaoData,
                rankingDisciplinas,
                questoes,
            });
        } finally {
            setIsExporting(false);
        }
    }, []);

    const exportDisciplinasReport = useCallback(async ({
        avaliacao,
        filtros,
        selectedQuestionLabel,
        processedRanking,
        topItems,
        bottomItems,
        rankingData,
    }) => {
        setIsExporting(true);
        try {
            const { exportedAt, datePart, timePart } = buildExportTimestamp();
            const filename = `CPA_RelatorioDisciplinas_${avaliacao?.id || 'NA'}_${datePart}_${timePart}`;

            buildDisciplinasPDF({
                avaliacao,
                exportedAt,
                filename,
                filtros,
                selectedQuestionLabel,
                processedRanking,
                topItems,
                bottomItems,
                rankingData,
            });
        } finally {
            setIsExporting(false);
        }
    }, []);

    return {
        isExporting,
        exportDashboardReport,
        exportAvaliacaoReport,
        exportDisciplinasReport,
    };
};

export default usePDFExport;
