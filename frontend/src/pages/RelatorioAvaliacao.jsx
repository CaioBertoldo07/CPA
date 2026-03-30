import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useGetAvaliacaoByIdQuery } from '../hooks/queries/useAvaliacaoQueries';
import { useGetRespostasPorAvaliacaoQuery, useGetRespostasPorDisciplinaQuery } from '../hooks/queries/useRespostaQueries';
import usePDFExport from '../hooks/usePDFExport';
import { useNotification } from '../context/NotificationContext';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/* ─────────────────────────── constants ─────────────────────────── */

const BAR_COLORS = ['#2e7d32', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const STATUS_MAP = {
    1: { label: 'Rascunho', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    2: { label: 'Enviada', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    3: { label: 'Encerrada', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

const TIPO_COLORS = { padrao: '#3b82f6', grade: '#2e7d32' };

/* ─────────────────────────── helpers ─────────────────────────── */

const fmt = d => {
    if (!d) return '—';
    const datePart = String(d).split('T')[0];
    const date = new Date(datePart + 'T00:00:00');
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
};




/* ─────────────────────────── shared UI ─────────────────────────── */

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[Number(status)] || STATUS_MAP[1];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 9999,
            background: s.bg, color: s.color,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.4px',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
            {s.label}
        </span>
    );
};

const SkeletonBlock = ({ w = '100%', h = 16 }) => (
    <div style={{
        width: w, height: h, borderRadius: 6,
        background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
        backgroundSize: '400% 100%',
        animation: 'skeletonPulse 1.4s ease infinite',
    }} />
);

const StatCard = ({ icon, label, value, topColor, iconBg, loading, delay = 0 }) => (
    <div
        style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            padding: '20px 20px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
            animation: `fadeInUp 400ms ${delay}ms both`,
            transition: 'box-shadow 200ms, transform 200ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.11)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: topColor, borderRadius: '14px 14px 0 0' }} />
        <div style={{ width: 46, height: 46, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
            {icon}
        </div>
        <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#1a202c', lineHeight: 1, marginBottom: 5 }}>
                {loading
                    ? <div style={{ width: 48, height: 28, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '400% 100%', animation: 'skeletonPulse 1.4s ease infinite' }} />
                    : value}
            </div>
            <div style={{ fontSize: 12, color: '#718096', fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
        </div>
    </div>
);

const ChartCard = ({ title, subtitle, children, loading, delay = 0, minH = 280 }) => (
    <div
        style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '20px 20px 16px',
            display: 'flex', flexDirection: 'column', minHeight: minH,
            animation: `fadeInUp 400ms ${delay}ms both`,
            transition: 'box-shadow 200ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
    >
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{subtitle}</div>}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading
                ? <div style={{ width: '100%', height: 200, borderRadius: 8, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '400% 100%', animation: 'skeletonPulse 1.4s ease infinite' }} />
                : children}
        </div>
    </div>
);

const ChartTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: 13 }}>
            {label && <div style={{ fontWeight: 600, color: '#1a202c', marginBottom: 6 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4a5568' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color || p.fill, display: 'inline-block', flexShrink: 0 }} />
                    <span>{p.name}: <strong style={{ color: '#1a202c' }}>{formatter ? formatter(p.value) : p.value}</strong></span>
                </div>
            ))}
        </div>
    );
};

const QuestaoTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 14px rgba(0,0,0,0.09)', fontSize: 13 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{p?.payload?.name}</p>
            <p style={{ margin: '2px 0', color: p?.fill || p?.color }}>
                {(p?.payload?.pct || 0).toFixed(2)}% <span style={{ color: '#718096', fontWeight: 400 }}>({p?.payload?.count} resp.)</span>
            </p>
        </div>
    );
};

const QuestaoCard = ({ questao, idx }) => {
    const disciplinas = useMemo(() => Object.keys(questao.por_disciplina || {}), [questao.por_disciplina]);
    const [discIdx, setDiscIdx] = React.useState(-1); // -1 = Visão Global

    // Processar dados dependendo da visão selecionada
    const currentData = useMemo(() => {
        if (discIdx === -1 || !questao.repetir_todas_disciplinas) {
            return {
                respostas: questao.respostas || {},
                total: questao.total || 0,
                adicionais: questao.adicionais || {}
            };
        }
        
        const dNome = disciplinas[discIdx];
        const dData = questao.por_disciplina[dNome];
        
        // Mapear respostas da disciplina para o formato esperado
        const mappedResps = {};
        Object.entries(dData.respostas || {}).forEach(([alt, count]) => {
            mappedResps[alt] = { absoluto: count, porcentagem: dData.respostas_pct[alt] };
        });

        // Mapear subquestões (grade) para a disciplina
        const mappedAdicionais = {};
        Object.entries(questao.adicionais || {}).forEach(([subNome, subInfo]) => {
            const subDData = subInfo.por_disciplina?.[dNome] || { respostas: {}, total: 0, respostas_pct: {} };
            const subResps = {};
            Object.entries(subDData.respostas || {}).forEach(([alt, count]) => {
                subResps[alt] = { absoluto: count, porcentagem: subDData.respostas_pct[alt] };
            });
            mappedAdicionais[subNome] = { ...subInfo, respostas: subResps, totalRespostas: subDData.total };
        });

        return {
            respostas: mappedResps,
            total: dData.total,
            adicionais: mappedAdicionais,
            nomeDisciplina: dNome
        };
    }, [discIdx, questao, disciplinas]);

    const resps = currentData.respostas;
    const rawEntries = Object.entries(resps)
        .map(([alt, info]) => ({ 
            name: alt, 
            count: info.absoluto,
            pct: parseFloat(info.porcentagem)
        }))
        .sort((a, b) => b.count - a.count);

    const chartData = rawEntries;

    return (
        <div style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderLeft: `4px solid ${questao.repetir_todas_disciplinas ? '#1D5E24' : '#4caf50'}`, 
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: '24px',
            animation: `fadeInUp 400ms ${idx * 50}ms both`,
            position: 'relative'
        }}>
            {/* Header & Carousel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', margin: '0 0 8px', lineHeight: 1.4 }}>
                        {questao.descricao}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {questao.repetir_todas_disciplinas && (
                            <span style={{ padding: '3px 10px', background: '#1D5E24', color: '#fff', borderRadius: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Por Disciplina
                            </span>
                        )}
                        <span style={{ padding: '2px 9px', background: '#f1f5f9', color: '#64748b', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid #e2e8f0' }}>
                           Eixo: {questao.dimensao}
                        </span>
                    </div>
                </div>

                {/* Seletor de Disciplina (Slides) */}
                {questao.repetir_todas_disciplinas && disciplinas.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 280, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'space-between' }}>
                            <button 
                                onClick={() => setDiscIdx(p => p > -1 ? p - 1 : disciplinas.length - 1)}
                                style={{ border: 'none', background: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: '#1D5E24' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                            </button>
                            
                            <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 40 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Visualizando:</div>
                                {discIdx === -1 ? (
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1D5E24' }}>Visão Global</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: '#1D5E24', opacity: 0.8, letterSpacing: '0.5px' }}>
                                            {currentData.nomeDisciplina?.split(' - ')[0]}
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1D5E24', lineHeight: 1.1, maxWidth: 180, margin: '0 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {currentData.nomeDisciplina?.split(' - ').slice(1).join(' - ')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setDiscIdx(p => p < disciplinas.length - 1 ? p + 1 : -1)}
                                style={{ border: 'none', background: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: '#1D5E24' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                            {discIdx === -1 ? `Média de ${disciplinas.length} disciplinas` : `Disciplina ${discIdx + 1} de ${disciplinas.length}`}
                        </div>
                    </div>
                )}
            </div>

            {chartData.length === 0 && Object.keys(currentData.adicionais).length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                    Nenhuma resposta registrada para esta seleção.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {questao.tipo === 'padrao' && (
                        <div className="questao-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 24 }}>
                            {/* Bar chart */}
                            <div>
                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Distribuição</p>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                        <Tooltip content={<QuestaoTooltip />} />
                                        <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                                            {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Progress bars */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Detalhamento das Respostas ({currentData.total} total)</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                                    {chartData.map((item, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: BAR_COLORS[i % BAR_COLORS.length] }}>
                                                    {item.pct}% <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 11 }}>({item.count})</span>
                                                </span>
                                            </div>
                                            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', borderRadius: 9999, width: `${item.pct}%`, background: BAR_COLORS[i % BAR_COLORS.length], transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {questao.tipo === 'grade' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {Object.entries(currentData.adicionais || {}).map(([subNome, subDados], sIdx) => {
                                const subChartData = Object.entries(subDados?.respostas || {}).map(([alt, info]) => ({
                                    name: alt,
                                    count: info?.absoluto || 0,
                                    pct: parseFloat(info?.porcentagem || 0)
                                })).sort((a, b) => b.count - a.count);

                                return (
                                    <div key={sIdx} style={{ padding: '20px', background: '#fcfcfc', borderRadius: 14, border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ width: 3, height: 16, background: '#3b82f6', borderRadius: 3 }} />
                                                {subNome}
                                            </p>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{subDados.totalRespostas} respostas</span>
                                        </div>
                                        
                                        <div className="questao-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                                            <ResponsiveContainer width="100%" height={100}>
                                                <BarChart data={subChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                                                    <XAxis dataKey="name" hide />
                                                    <YAxis hide />
                                                    <Tooltip content={<QuestaoTooltip />} />
                                                    <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
                                                        {subChartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {subChartData.slice(0, 4).map((item, i) => (
                                                    <div key={i}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                                            <span style={{ fontSize: 11, color: '#4a5568', fontWeight: 600 }}>{item.name}</span>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: BAR_COLORS[i % BAR_COLORS.length] }}>{item.pct}%</span>
                                                        </div>
                                                        <div style={{ height: 5, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', borderRadius: 9999, width: `${item.pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div >
    );
};

/* ─────────────────────────── icons ─────────────────────────── */

const IconChart = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);
const IconList = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

/* ─────────────────────────── page ─────────────────────────── */

const RelatorioAvaliacao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isExporting, exportAvaliacaoReport } = usePDFExport();
    const showNotification = useNotification();

    // Filtros globais
    const [filtros, setFiltros] = React.useState({ unidade: '', curso: '', municipio: '' });
    const [opcoesFiltros, setOpcoesFiltros] = React.useState(null);

    const { data: avaliacao, isLoading: loadingAvaliacao, isError: isErrorAvaliacao } = useGetAvaliacaoByIdQuery(id);
    const { data: reportData, isLoading: loadingRespostas, isError: isErrorRespostas, refetch } = useGetRespostasPorAvaliacaoQuery(id, filtros);
    const {
        data: rankingData = [],
        isLoading: loadingRanking,
    } = useGetRespostasPorDisciplinaQuery(id, {
        unidade: filtros.unidade,
        curso: filtros.curso,
    });

    const handleFiltroChange = (key, value) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    };

    const questoesAchatadas = useMemo(() => {
        if (!reportData?.relatorio) return [];
        const flat = [];
        
        // Iterar pelos Eixos
        Object.values(reportData.relatorio).forEach(eixo => {
            if (!eixo.dimensoes) return;
            
            // Iterar pelas Dimensões
            Object.values(eixo.dimensoes).forEach(dim => {
                if (!dim.questoes || !Array.isArray(dim.questoes)) return;
                
                // Iterar pelas Questões
                dim.questoes.forEach(q => {
                    const alternativasConsolidadas = { ...q.respostas };
                    let totalGeral = q.totalRespostas || 0;
                    
                    // Tratamento para questões do tipo GRADE
                    if (q.id_tipo === 2 || q.tipo === 2 || q.tipo === 'grade') {
                        if (Object.keys(q.adicionais || {}).length > 0) {
                            Object.values(q.adicionais).forEach((subitem) => {
                                Object.entries(subitem.respostas || {}).forEach(([alt, resp]) => {
                                    if (!alternativasConsolidadas[alt]) {
                                        alternativasConsolidadas[alt] = { absoluto: 0, porcentagem: "0.00" };
                                    }
                                    alternativasConsolidadas[alt].absoluto += (resp.absoluto || 0);
                                });
                            });
                            
                            // Recalcular total geral da grade
                            totalGeral = Object.values(alternativasConsolidadas).reduce((sum, curr) => sum + curr.absoluto, 0);
                            
                            // Recalcular porcentagens consolidadas
                            if (totalGeral > 0) {
                                Object.keys(alternativasConsolidadas).forEach(alt => {
                                    alternativasConsolidadas[alt].porcentagem = ((alternativasConsolidadas[alt].absoluto / totalGeral) * 100).toFixed(2);
                                });
                            }
                        }
                    }
                    
                    flat.push({ 
                        ...q, 
                        total: totalGeral, 
                        dimensao: dim.nome, 
                        tipo: (q.id_tipo === 2 || q.tipo === 2 || q.tipo === 'grade') ? 'grade' : 'padrao' 
                    });
                });
            });
        });
        return flat;
    }, [reportData]);

    const totalRespostas = useMemo(
        () => questoesAchatadas.reduce((acc, q) => acc + q.total, 0),
        [questoesAchatadas],
    );

    const totalQuestoesAvaliacao = avaliacao?.avaliacao_questoes?.length ?? null;



    const questoesRespondidas = questoesAchatadas.filter(q => q.total > 0).length;

    const participacaoData = useMemo(() => {
        if (!reportData?.participacao) return { unidade: [], curso: [], municipio: [] };
        
        const format = (obj) => Object.entries(obj)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return {
            unidade: format(reportData.participacao.unidade),
            curso: format(reportData.participacao.curso),
            municipio: format(reportData.participacao.municipio),
        };
    }, [reportData]);

    const rankingDisciplinas = useMemo(() => {
        if (!Array.isArray(rankingData) || rankingData.length === 0) return [];

        return rankingData
            .map(item => ({
                name: item.disciplina,
                score: Number(item.scoreGeral) || 0,
                total: Number(item.totalRespostas) || 0,
            }))
            .sort((a, b) => b.score - a.score);
    }, [rankingData]);

    // Capturar opções iniciais
    React.useEffect(() => {
        if (reportData?.participacao && !filtros.unidade && !filtros.curso && !filtros.municipio && !opcoesFiltros) {
            setOpcoesFiltros(participacaoData);
        }
    }, [reportData, filtros, participacaoData, opcoesFiltros]);

    const stats = [
        { icon: '👥', label: 'Total de Avaliadores', value: reportData?.totalAvaliadores || 0, topColor: '#2e7d32', iconBg: '#e8f5e9', delay: 0 },
        ...(totalQuestoesAvaliacao !== null
            ? [{ icon: '📋', label: 'Total de Questões', value: totalQuestoesAvaliacao, topColor: '#94a3b8', iconBg: '#f1f5f9', delay: 140 }]
            : []),
    ];

    const handleExportPDF = async () => {
        try {
            if (loadingRanking) {
                showNotification('Aguarde o carregamento do ranking para exportar o PDF completo.', 'warning');
                return;
            }

            await exportAvaliacaoReport({
                avaliacao,
                filtros,
                totalAvaliadores: reportData?.totalAvaliadores || 0,
                totalQuestoes: totalQuestoesAvaliacao || 0,
                totalRespostas,
                questoesRespondidas,
                participacaoData,
                rankingDisciplinas,
                questoes: questoesAchatadas,
            });

            showNotification('Relatório exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar relatório para PDF:', error);
            showNotification('Não foi possível exportar o relatório para PDF.', 'error');
        }
    };

    /* ── loading / error states ── */

    if (loadingAvaliacao || loadingRespostas) return (
        <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', paddingTop: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SkeletonBlock h={40} w="60%" />
                <SkeletonBlock h={20} w="40%" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
                    <SkeletonBlock h={120} />
                    <SkeletonBlock h={120} />
                    <SkeletonBlock h={120} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
                    <SkeletonBlock h={300} />
                    <SkeletonBlock h={300} />
                </div>
            </div>
        </div>
    );

    if (isErrorAvaliacao) return (
        <div style={{ width: '100%', maxWidth: '1600px', paddingTop: 32 }}>
            <div style={{ background: '#fff', border: '1px solid #fee2e2', borderRadius: 14, padding: 24, color: '#dc2626' }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Erro ao carregar dados da avaliação.</p>
                <button
                    onClick={() => navigate('/relatorios')}
                    style={{ padding: '6px 16px', background: 'transparent', border: '1.5px solid #dc2626', color: '#dc2626', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                >
                    ← Voltar
                </button>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes fadeInUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes skeletonPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                .recharts-tooltip-cursor { fill: rgba(0,0,0,0.04) !important; }
                @media (max-width: 768px) {
                    .insights-grid  { grid-template-columns: 1fr !important; }
                    .questoes-grid  { grid-template-columns: 1fr !important; }
                    .questao-inner  { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div className="container" style={{ width: '100%', paddingTop: 32, paddingBottom: 48 }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#718096', marginBottom: 24 }}>
                    <button
                        onClick={() => navigate('/relatorios')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'transparent', color: '#4a5568', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, transition: 'background 150ms' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Dashboard Geral
                    </button>
                    <span style={{ color: '#cbd5e1' }}>/</span>
                    <span>Avaliação #{avaliacao?.id}</span>
                </div>

                {/* Cabeçalho */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px', lineHeight: 1.25 }}>
                            Dashboard Avaliação #{avaliacao?.id}
                        </h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                            Período: {avaliacao?.periodo_letivo || '—'} · Ano: {avaliacao?.ano || '—'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '8px 16px',
                                background: isExporting ? '#dcfce7' : '#1D5E24',
                                color: isExporting ? '#166534' : '#fff',
                                border: '1.5px solid #1D5E24', borderRadius: 10,
                                fontSize: 13, fontWeight: 700,
                                cursor: isExporting ? 'not-allowed' : 'pointer',
                                transition: 'all 150ms',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                opacity: isExporting ? 0.85 : 1,
                            }}
                            onMouseEnter={e => {
                                if (isExporting) return;
                                e.currentTarget.style.background = '#166534';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                if (isExporting) return;
                                e.currentTarget.style.background = '#1D5E24';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            {isExporting ? 'Exportando...' : 'Exportar PDF'}
                        </button>
                        <button
                            onClick={() => navigate(`/relatorio/${id}/disciplinas`)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '8px 16px', background: '#fff', color: '#1D5E24',
                                border: '1.5px solid #1D5E24', borderRadius: 10,
                                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                transition: 'all 150ms', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                            Ranking por Disciplina
                        </button>
                        <StatusBadge status={avaliacao?.status} />
                    </div>
                </div>

                <div id="relatorio-avaliacao-export-content" style={{ background: '#ffffff' }}>
                {/* Info card */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.07)', padding: '20px 24px', marginBottom: 24, animation: 'fadeInUp 400ms 60ms both' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', margin: '0 0 16px' }}>
                        Informações da Avaliação
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
                        {[
                            { label: 'Início', value: fmt(avaliacao?.data_inicio) },
                            { label: 'Fim', value: fmt(avaliacao?.data_fim) },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 3 }}>{label}</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a202c' }}>{value}</div>
                            </div>
                        ))}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 6 }}>Modalidades</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {(avaliacao?.modalidades || []).length > 0
                                    ? avaliacao.modalidades.map((m, i) => (
                                        <span key={i} style={{ padding: '2px 9px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 9999, fontSize: 11, fontWeight: 500, border: '1px solid #a5d6a7' }}>{m.mod_ensino}</span>
                                    ))
                                    : <span style={{ color: '#718096', fontSize: 13 }}>—</span>
                                }
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 6 }}>Unidades</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {(avaliacao?.unidade || []).length > 0
                                    ? avaliacao.unidade.map((u, i) => (
                                        <span key={i} style={{ padding: '2px 9px', background: '#f1f5f9', color: '#4a5568', borderRadius: 9999, fontSize: 11, fontWeight: 500, border: '1px solid #e2e8f0' }}>{u.sigla || u.nome}</span>
                                    ))
                                    : <span style={{ color: '#718096', fontSize: 13 }}>—</span>
                                }
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 6 }}>Categorias de Avaliadores</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {(avaliacao?.categorias || []).length > 0
                                    ? avaliacao.categorias.map((c, i) => (
                                        <span key={i} style={{ padding: '2px 9px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 9999, fontSize: 11, fontWeight: 500, border: '1px solid #bfdbfe' }}>{c.nome}</span>
                                    ))
                                    : <span style={{ color: '#718096', fontSize: 13 }}>—</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* StatCards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32, alignItems: 'stretch' }}>
                    {stats.map(s => <StatCard key={s.label} {...s} loading={loadingRespostas} />)}
                </div>

                {/* ── Gráficos & Insights ── */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                            <IconChart />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a202c' }}>Gráficos & Insights</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>Distribuição das respostas por dimensão e tipo de questão</div>
                        </div>
                    </div>

                    <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {/* Filtros de Relatório */}
                        <div style={{ gridColumn: 'span 2', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4a5568', fontSize: 13, fontWeight: 600 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                                FILTRAR POR:
                            </div>
                            
                            {/* Unidade */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 150 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Unidade</label>
                                <select 
                                    value={filtros.unidade} 
                                    onChange={(e) => handleFiltroChange('unidade', e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a202c', outline: 'none', background: '#f8fafc' }}
                                >
                                    <option value="">Todas as Unidades</option>
                                    {(opcoesFiltros?.unidade || participacaoData.unidade).map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                                </select>
                            </div>

                            {/* Município */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 150 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Município</label>
                                <select 
                                    value={filtros.municipio} 
                                    onChange={(e) => handleFiltroChange('municipio', e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a202c', outline: 'none', background: '#f8fafc' }}
                                >
                                    <option value="">Todos os Municípios</option>
                                    {(opcoesFiltros?.municipio || participacaoData.municipio).map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                                </select>
                            </div>

                            {/* Curso */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200, flex: 1 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Curso</label>
                                <select 
                                    value={filtros.curso} 
                                    onChange={(e) => handleFiltroChange('curso', e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a202c', outline: 'none', background: '#f8fafc' }}
                                >
                                    <option value="">Todos os Cursos</option>
                                    {(opcoesFiltros?.curso || participacaoData.curso).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <button 
                                onClick={() => setFiltros({ unidade: '', curso: '', municipio: '' })}
                                style={{ marginTop: 18, padding: '7px 12px', background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >
                                Limpar
                            </button>
                        </div>

                        {/* Participação por Unidade */}
                        <ChartCard
                            title="Participação por Unidade"
                            subtitle="Divisão de respondentes por unidade acadêmica"
                            loading={loadingRespostas}
                            delay={80}
                            minH={300}
                        >
                            {participacaoData.unidade.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sem dados de unidade registrado</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={participacaoData.unidade}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={85}
                                            paddingAngle={4} dataKey="value"
                                            animationDuration={1000}
                                        >
                                            {participacaoData.unidade.map((_, i) => (
                                                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* Participação por Curso (Top 10) */}
                        <ChartCard
                            title="Participação por Curso"
                            subtitle="Top 10 cursos com mais participações nesta avaliação"
                            loading={loadingRespostas}
                            delay={130}
                            minH={300}
                        >
                            {participacaoData.curso.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sem dados de curso registrados</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={participacaoData.curso} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            type="category" 
                                            dataKey="name" 
                                            width={100} 
                                            tick={{ fontSize: 10, fill: '#4a5568' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<ChartTooltip formatter={v => v + ' respondentes'} />} cursor={{ fill: '#f8fafc' }} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>
                    </div>
                </div>

                {/* ── Respostas por Questão ── */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568' }}>
                            <IconList />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a202c' }}>Respostas por Questão</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>Distribuição de alternativas para cada questão respondida</div>
                        </div>
                    </div>

                    {loadingRespostas ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <SkeletonBlock h={14} w="40%" />
                                    <SkeletonBlock h={100} />
                                </div>
                            ))}
                        </div>
                    ) : isErrorRespostas ? (
                        <div style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 14, padding: 20, color: '#92400e', fontSize: 13 }}>
                            Não foi possível carregar as respostas desta avaliação.
                        </div>
                    ) : Object.keys(reportData?.relatorio || {}).length === 0 ? (
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center', color: '#718096' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                            <p style={{ margin: 0, fontSize: 14 }}>Esta avaliação ainda não possui respostas registradas.</p>
                        </div>
                    ) : (
                        <div className="eixos-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {Object.entries(reportData.relatorio).sort((a, b) => a[1].numero - b[1].numero).map(([eixoKey, eixo]) => (
                                <Accordion 
                                    key={eixoKey} 
                                    defaultExpanded 
                                    sx={{ 
                                        borderRadius: '16px !important', 
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                                        border: '1px solid #e2e8f0',
                                        '&:before': { display: 'none' }
                                    }}
                                >
                                    <AccordionSummary 
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{ 
                                            background: '#f8fafc', 
                                            borderRadius: '16px 16px 0 0',
                                            padding: '12px 24px',
                                            '& .MuiAccordionSummary-content': { margin: '12px 0' }
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ background: '#2e7d32', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                                                {eixo.numero}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eixo {eixo.numero}</div>
                                                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a202c' }}>{eixo.nome}</div>
                                            </div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ padding: '24px', background: '#fff', borderRadius: '0 0 16px 16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                            {Object.entries(eixo.dimensoes).sort((a, b) => a[1].numero - b[1].numero).map(([dimKey, dim]) => (
                                                <div key={dimKey}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 10, borderBottom: '1.5px solid #f1f5f9' }}>
                                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#2e7d32' }}>Dimensão {dim.numero}:</div>
                                                        <div style={{ fontSize: 15, fontWeight: 600, color: '#4a5568' }}>{dim.nome}</div>
                                                    </div>
                                                    <div className="questoes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                                                        {dim.questoes.map((q, qIdx) => {
                                                            // Adaptar formato para QuestaoCard localmente
                                                            const alternativasConsolidadas = { ...q.respostas };
                                                            let totalGeral = q.totalRespostas;

                                                            if (Object.keys(q.adicionais || {}).length > 0) {
                                                                Object.values(q.adicionais).forEach((subitem) => {
                                                                    Object.entries(subitem.respostas || {}).forEach(([alt, resp]) => {
                                                                        if (!alternativasConsolidadas[alt]) {
                                                                            alternativasConsolidadas[alt] = { absoluto: 0, porcentagem: "0.00" };
                                                                        }
                                                                        alternativasConsolidadas[alt].absoluto += resp.absoluto;
                                                                    });
                                                                });

                                                                totalGeral = Object.values(alternativasConsolidadas).reduce((sum, curr) => sum + curr.absoluto, 0);
                                                                if (totalGeral > 0) {
                                                                    Object.keys(alternativasConsolidadas).forEach(alt => {
                                                                        alternativasConsolidadas[alt].porcentagem = ((alternativasConsolidadas[alt].absoluto / totalGeral) * 100).toFixed(2);
                                                                    });
                                                                }
                                                            }

                                                            const qProcessada = {
                                                                ...q,
                                                                respostas: alternativasConsolidadas,
                                                                total: totalGeral,
                                                                tipo: q.tipo === 2 ? 'grade' : 'padrao'
                                                            };

                                                            return <QuestaoCard key={q.id_avaliacao_questoes ?? qIdx} questao={qProcessada} idx={qIdx} />;
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Ranking por Disciplina (incluído na exportação PDF) ── */}
                <div style={{ marginTop: 36 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
                            <IconChart />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a202c' }}>Ranking por Disciplina</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>Resumo incluído na exportação do relatório individual</div>
                        </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 120px 140px', gap: 8, padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            <div>Posição</div>
                            <div>Disciplina</div>
                            <div style={{ textAlign: 'center' }}>Respostas</div>
                            <div style={{ textAlign: 'right' }}>Pontuação</div>
                        </div>

                        {loadingRanking ? (
                            <div style={{ padding: '14px 16px' }}>
                                <SkeletonBlock h={16} />
                            </div>
                        ) : rankingDisciplinas.length === 0 ? (
                            <div style={{ padding: '18px 16px', color: '#718096', fontSize: 13 }}>
                                Sem dados de ranking por disciplina para os filtros selecionados.
                            </div>
                        ) : (
                            rankingDisciplinas.slice(0, 10).map((item, idx) => (
                                <div
                                    key={`${item.name}-${idx}`}
                                    style={{ display: 'grid', gridTemplateColumns: '70px 1fr 120px 140px', gap: 8, padding: '11px 16px', borderBottom: idx === Math.min(rankingDisciplinas.length, 10) - 1 ? 'none' : '1px solid #f1f5f9', alignItems: 'center' }}
                                >
                                    <div>
                                        <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: idx < 3 ? '#ecfdf5' : '#f1f5f9', color: idx < 3 ? '#166534' : '#64748b', fontSize: 12, fontWeight: 700 }}>
                                            {idx + 1}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#1f2937', fontWeight: 600 }}>{item.name}</div>
                                    <div style={{ textAlign: 'center', fontSize: 13, color: '#475569' }}>{item.total}</div>
                                    <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: item.score >= 70 ? '#166534' : (item.score >= 50 ? '#b45309' : '#b91c1c') }}>
                                        {item.score.toFixed(1)}%
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                </div>
            </div>
        </>
    );
};

export default RelatorioAvaliacao;
