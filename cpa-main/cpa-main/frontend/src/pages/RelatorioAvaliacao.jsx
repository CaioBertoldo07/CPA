import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useGetAvaliacaoByIdQuery } from '../hooks/queries/useAvaliacaoQueries';
import { useGetRespostasPorAvaliacaoQuery } from '../hooks/queries/useRespostaQueries';

/* ─────────────────────────── constants ─────────────────────────── */

const BAR_COLORS = ['#2e7d32', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const STATUS_MAP = {
    1: { label: 'Rascunho',  bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    2: { label: 'Enviada',   bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    3: { label: 'Encerrada', bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
};

const TIPO_COLORS = { padrao: '#3b82f6', grade: '#2e7d32' };

/* ─────────────────────────── helpers ─────────────────────────── */

const fmt = d => {
    if (!d) return '—';
    const datePart = String(d).split('T')[0];
    const date = new Date(datePart + 'T00:00:00');
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
};

/**
 * Converte o array retornado por /api/avaliacoes/:id/respostas para
 * o formato consumido por QuestaoCard.
 *
 * Formato do backend:
 *   tipo='padrao' → { id, descricao, dimensao, respostas: [{valor, comentario}],     tipo }
 *   tipo='grade'  → { id, descricao, dimensao, respostas: {[adicionalId]: [{valor}]}, tipo }
 */
const processarQuestoes = (respostas = []) =>
    respostas.map(item => {
        const alternativas = {};
        let total = 0;

        if (item.tipo === 'padrao') {
            for (const r of (item.respostas || [])) {
                const val = r.valor ?? 'Sem resposta';
                alternativas[val] = (alternativas[val] || 0) + 1;
                total += 1;
            }
        } else {
            // grade: respostas é { [adicionalId]: [{valor, comentario}] }
            for (const subList of Object.values(item.respostas || {})) {
                for (const r of (subList || [])) {
                    const val = r.valor ?? 'Sem resposta';
                    alternativas[val] = (alternativas[val] || 0) + 1;
                    total += 1;
                }
            }
        }

        return {
            id:        item.id,
            descricao: item.descricao || `Questão ${item.id}`,
            dimensao:  item.dimensao  || '—',
            tipo:      item.tipo,
            total,
            alternativas,
        };
    });

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
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';  e.currentTarget.style.transform = 'translateY(0)'; }}
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
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 14px rgba(0,0,0,0.09)', fontSize: 13 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{payload[0]?.payload?.name}</p>
            <p style={{ margin: '2px 0', color: payload[0]?.fill }}>
                {payload[0]?.value} resp. ({payload[0]?.payload?.pct}%)
            </p>
        </div>
    );
};

const DonutLegend = ({ data }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        {data.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#4a5568', minWidth: 60 }}>{d.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a202c' }}>{d.value}</span>
            </div>
        ))}
    </div>
);

/* ─────────────────────────── QuestaoCard ─────────────────────────── */

const QuestaoCard = ({ questao, idx }) => {
    const chartData = Object.entries(questao.alternativas).map(([alt, count]) => ({
        name: alt,
        value: count,
        pct: questao.total > 0 ? Math.round((count / questao.total) * 100) : 0,
    }));

    return (
        <div style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderLeft: '3px solid #4caf50', borderRadius: 14,
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
            padding: '20px 24px',
            animation: `fadeInUp 400ms ${idx * 50}ms both`,
        }}>
            {/* Header */}
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1a202c', margin: '0 0 10px', lineHeight: 1.5, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {questao.descricao}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                {questao.dimensao !== '—' && (
                    <span style={{ padding: '2px 9px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 9999, fontSize: 11, fontWeight: 500, border: '1px solid #a5d6a7' }}>
                        {questao.dimensao}
                    </span>
                )}
                <span style={{ padding: '2px 9px', background: '#f1f5f9', color: '#64748b', borderRadius: 9999, fontSize: 11, border: '1px solid #e2e8f0' }}>
                    {questao.tipo === 'grade' ? 'Grade' : 'Padrão'}
                </span>
                <span style={{ padding: '2px 9px', background: '#f1f5f9', color: '#4a5568', borderRadius: 9999, fontSize: 11, border: '1px solid #e2e8f0' }}>
                    {questao.total} resp.
                </span>
            </div>

            {chartData.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Sem respostas registradas.</p>
            ) : (
                <div className="questao-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Bar chart */}
                    <div>
                        <p style={{ fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>
                            Distribuição
                        </p>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -22, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<QuestaoTooltip />} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Progress bars */}
                    <div>
                        <p style={{ fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>
                            Detalhamento
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {chartData.map((item, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: '#4a5568', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '58%' }}>
                                            {item.name}
                                        </span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: BAR_COLORS[i % BAR_COLORS.length], flexShrink: 0 }}>
                                            {item.pct}% <span style={{ color: '#718096', fontWeight: 400 }}>({item.value})</span>
                                        </span>
                                    </div>
                                    <div style={{ height: 7, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', borderRadius: 9999, width: `${item.pct}%`, background: BAR_COLORS[i % BAR_COLORS.length], transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
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

    const { data: avaliacao, isLoading: loadingAvaliacao, isError: isErrorAvaliacao } = useGetAvaliacaoByIdQuery(id);
    const { data: respostas = [], isLoading: loadingRespostas, isError: isErrorRespostas } = useGetRespostasPorAvaliacaoQuery(id);

    const questoesProcessadas = useMemo(() => processarQuestoes(respostas), [respostas]);

    const totalRespostas = useMemo(
        () => questoesProcessadas.reduce((acc, q) => acc + q.total, 0),
        [questoesProcessadas],
    );

    // /api/avaliacoes/:id pode incluir avaliacao_questoes se o endpoint retornar esse relacionamento
    const totalQuestoesAvaliacao = avaliacao?.avaliacao_questoes?.length ?? null;

    const dimensaoData = useMemo(() => {
        const counts = {};
        questoesProcessadas.forEach(q => {
            const dim = q.dimensao || '—';
            counts[dim] = (counts[dim] || 0) + q.total;
        });
        return Object.entries(counts)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);
    }, [questoesProcessadas]);

    const tipoData = useMemo(() => [
        { name: 'Padrão', value: questoesProcessadas.filter(q => q.tipo === 'padrao').length, color: TIPO_COLORS.padrao },
        { name: 'Grade',  value: questoesProcessadas.filter(q => q.tipo === 'grade').length,  color: TIPO_COLORS.grade  },
    ].filter(d => d.value > 0), [questoesProcessadas]);

    /* ── loading / error states ── */

    if (loadingAvaliacao) return (
        <>
            <style>{`@keyframes skeletonPulse{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
            <div style={{ width: '100%', maxWidth: '1600px', paddingTop: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
                    <SkeletonBlock h={32} w="50%" />
                    <SkeletonBlock h={16} w="35%" />
                    <SkeletonBlock h={120} />
                    <SkeletonBlock h={120} />
                </div>
            </div>
        </>
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

    const stats = [
        { icon: '📊', label: 'Total de Respostas',    value: totalRespostas,              topColor: '#2e7d32', iconBg: '#e8f5e9', delay: 0   },
        { icon: '✅', label: 'Questões Respondidas',  value: questoesProcessadas.length,  topColor: '#3b82f6', iconBg: '#dbeafe', delay: 70  },
        ...(totalQuestoesAvaliacao !== null
            ? [{ icon: '📋', label: 'Total de Questões', value: totalQuestoesAvaliacao, topColor: '#94a3b8', iconBg: '#f1f5f9', delay: 140 }]
            : []),
    ];

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

            <div className="container" style={{ width: '100%', maxWidth: '1600px', paddingTop: 32, paddingBottom: 48 }}>

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
                    <StatusBadge status={avaliacao?.status} />
                </div>

                {/* Info card */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.07)', padding: '20px 24px', marginBottom: 24, animation: 'fadeInUp 400ms 60ms both' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', margin: '0 0 16px' }}>
                        Informações da Avaliação
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
                        {[
                            { label: 'Início', value: fmt(avaliacao?.data_inicio) },
                            { label: 'Fim',    value: fmt(avaliacao?.data_fim)    },
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
                                {(avaliacao?.unidades || []).length > 0
                                    ? avaliacao.unidades.map((u, i) => (
                                        <span key={i} style={{ padding: '2px 9px', background: '#f1f5f9', color: '#4a5568', borderRadius: 9999, fontSize: 11, fontWeight: 500, border: '1px solid #e2e8f0' }}>{u.sigla || u.nome}</span>
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

                        {/* Chart 1 — por Dimensão */}
                        <ChartCard
                            title="Respostas por Dimensão"
                            subtitle="Quantidade de respostas agrupadas por dimensão"
                            loading={loadingRespostas}
                            delay={80}
                            minH={300}
                        >
                            {dimensaoData.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sem dados para exibir</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={dimensaoData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }} barCategoryGap="30%">
                                        <defs>
                                            <linearGradient id="dimGrad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#4caf50" />
                                                <stop offset="100%" stopColor="#2e7d32" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={false} tickLine={false} width={110} />
                                        <Tooltip content={<ChartTooltip formatter={v => v + ' respostas'} />} cursor={{ fill: 'rgba(46,125,50,0.06)' }} />
                                        <Bar dataKey="total" name="Respostas" fill="url(#dimGrad)" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* Chart 2 — por Tipo */}
                        <ChartCard
                            title="Questões por Tipo"
                            subtitle="Proporção entre questões de padrão e grade"
                            loading={loadingRespostas}
                            delay={130}
                            minH={300}
                        >
                            {tipoData.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sem dados para exibir</div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%', flexWrap: 'wrap' }}>
                                    <ResponsiveContainer width={180} height={180}>
                                        <PieChart>
                                            <Pie
                                                data={tipoData}
                                                cx="50%" cy="50%"
                                                innerRadius={52} outerRadius={82}
                                                paddingAngle={3} dataKey="value"
                                                animationBegin={0} animationDuration={900}
                                            >
                                                {tipoData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <DonutLegend data={tipoData} />
                                </div>
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
                    ) : questoesProcessadas.length === 0 ? (
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center', color: '#718096' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                            <p style={{ margin: 0, fontSize: 14 }}>Esta avaliação ainda não possui respostas registradas.</p>
                        </div>
                    ) : (
                        <div className="questoes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            {questoesProcessadas.map((q, idx) => (
                                <QuestaoCard key={q.id ?? idx} questao={q} idx={idx} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </>
    );
};

export default RelatorioAvaliacao;
