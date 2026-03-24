import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useGetAvaliacoesQuery } from '../hooks/queries/useAvaliacaoQueries';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

/* ───────── Icons ───────── */
const IconClipboard = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);
const IconSend = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
const IconLock = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const IconDraft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);
const IconEye = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const IconChart = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

/* ───────── Status helpers ───────── */
const STATUS_MAP = {
    1: { label: 'Rascunho', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    2: { label: 'Enviada', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    3: { label: 'Encerrada', bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
};

const CHART_COLORS = {
    encerrada: '#2e7d32',
    enviada: '#3b82f6',
    rascunho: '#94a3b8',
};

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP[1];
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

/* ───────── StatCard ───────── */
const StatCard = ({ icon, label, value, topColor, iconBg, loading, delay = 0 }) => (
    <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        padding: '20px 20px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        position: 'relative', overflow: 'hidden',
        height: '100%',
        animation: `fadeInUp 400ms ${delay}ms both`,
        transition: 'box-shadow 200ms, transform 200ms',
        cursor: 'default',
    }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.11)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: topColor, borderRadius: '14px 14px 0 0' }} />
        <div style={{
            width: 46, height: 46, borderRadius: 12, background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#1a202c', lineHeight: 1, marginBottom: 5 }}>
                {loading ? (
                    <div style={{ width: 48, height: 28, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '400% 100%', animation: 'skeletonPulse 1.4s ease infinite' }} />
                ) : value}
            </div>
            <div style={{ fontSize: 12, color: '#718096', fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
        </div>
    </div>
);

/* ───────── Chart Card wrapper ───────── */
const ChartCard = ({ title, subtitle, children, loading, delay = 0, minH = 280 }) => (
    <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        padding: '20px 20px 16px',
        display: 'flex', flexDirection: 'column',
        minHeight: minH,
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
            {loading ? <ChartSkeleton /> : children}
        </div>
    </div>
);

/* ───────── Chart Skeleton ───────── */
const ChartSkeleton = () => (
    <div style={{ width: '100%', height: 200, borderRadius: 8, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '400% 100%', animation: 'skeletonPulse 1.4s ease infinite' }} />
);

/* ───────── Custom Tooltip ───────── */
const ChartTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            fontSize: 13,
        }}>
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

/* ───────── Circular Progress (SVG) ───────── */
const CircularProgress = ({ pct, color = '#2e7d32', total, encerradas }) => {
    const r = 52;
    const circumference = 2 * Math.PI * r;
    const dash = Math.min((pct / 100) * circumference, circumference);
    const gap = circumference - dash;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
            <svg width="150" height="150" viewBox="0 0 150 150" style={{ overflow: 'visible' }}>
                {/* Background track */}
                <circle cx="75" cy="75" r={r} fill="none" stroke="#f1f5f9" strokeWidth="13" />
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4caf50" />
                        <stop offset="100%" stopColor="#2e7d32" />
                    </linearGradient>
                </defs>
                {/* Progress arc */}
                <circle
                    cx="75" cy="75" r={r} fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="13"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeLinecap="round"
                    transform="rotate(-90 75 75)"
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
                {/* Center text */}
                <text x="75" y="69" textAnchor="middle" fontSize="28" fontWeight="700" fill="#1a202c">{pct}%</text>
                <text x="75" y="88" textAnchor="middle" fontSize="11" fill="#718096">Concluídas</text>
            </svg>
            {/* Stats below circle */}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#2e7d32' }}>{encerradas}</div>
                    <div style={{ fontSize: 11, color: '#718096' }}>Encerradas</div>
                </div>
                <div style={{ width: 1, background: '#e2e8f0' }} />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1a202c' }}>{total}</div>
                    <div style={{ fontSize: 11, color: '#718096' }}>Total</div>
                </div>
            </div>
        </div>
    );
};

/* ───────── Donut Legend ───────── */
const DonutLegend = ({ data }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        {data.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#4a5568', minWidth: 75 }}>{d.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a202c' }}>{d.value}</span>
            </div>
        ))}
    </div>
);

/* ───────── Skeleton Row ───────── */
const SkeletonRow = () => (
    <tr>
        {[50, 120, 70, 55, 80, 80, 90, 60].map((w, i) => (
            <td key={i} style={{ padding: '15px 16px' }}>
                <div style={{ height: 13, width: w, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '400% 100%', animation: 'skeletonPulse 1.4s ease infinite' }} />
            </td>
        ))}
    </tr>
);

const fmt = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const thStyle = {
    padding: '11px 16px', fontSize: 11, fontWeight: 600,
    color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px',
    textAlign: 'left', whiteSpace: 'nowrap',
    background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
};
const tdStyle = { padding: '14px 16px', color: '#1a202c', verticalAlign: 'middle', fontSize: 13 };

/* ───────── Main Component ───────── */
const Relatorios = () => {
    const showNotification = useNotification();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: _avaliacoesResp,
        isLoading: loading,
        isError
    } = useGetAvaliacoesQuery();
    const avaliacoes = _avaliacoesResp?.data ?? [];

    useEffect(() => {
        if (isError) {
            showNotification('Não foi possível carregar as avaliações.', 'error');
        }
    }, [isError, showNotification]);

    const total = avaliacoes.length;
    const enviadas = avaliacoes.filter(a => a.status === 2).length;
    const encerradas = avaliacoes.filter(a => a.status === 3).length;
    const rascunhos = avaliacoes.filter(a => a.status === 1).length;
    const progressPct = total > 0 ? Math.round((encerradas / total) * 100) : 0;

    /* ── Chart data ── */
    const statusData = useMemo(() => [
        { name: 'Rascunho', value: rascunhos, color: CHART_COLORS.rascunho },
        { name: 'Enviada', value: enviadas, color: CHART_COLORS.enviada },
        { name: 'Encerrada', value: encerradas, color: CHART_COLORS.encerrada },
    ].filter(d => d.value > 0), [rascunhos, enviadas, encerradas]);

    const anoData = useMemo(() => {
        const counts = {};
        avaliacoes.forEach(av => {
            const year = av.ano || 'N/A';
            counts[year] = (counts[year] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([ano, total]) => ({ ano, total }))
            .sort((a, b) => String(a.ano).localeCompare(String(b.ano)));
    }, [avaliacoes]);

    const modalidadesData = useMemo(() => {
        const counts = {};
        avaliacoes.forEach(av => {
            (av.modalidades || []).forEach(m => {
                const name = m.mod_ensino || 'Desconhecida';
                counts[name] = (counts[name] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);
    }, [avaliacoes]);

    const filtered = avaliacoes.filter(a => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return String(a.id).includes(q) || (a.periodo_letivo || '').toLowerCase().includes(q)
            || (a.ano || '').toLowerCase().includes(q)
            || (a.modalidades || []).some(m => (m.mod_ensino || '').toLowerCase().includes(q));
    });

    const stats = [
        { icon: <IconClipboard />, label: 'Total de Avaliações', value: total, topColor: '#2e7d32', iconBg: '#e8f5e9', delay: 0 },
        { icon: <IconSend />, label: 'Enviadas', value: enviadas, topColor: '#3b82f6', iconBg: '#dbeafe', delay: 70 },
        { icon: <IconLock />, label: 'Encerradas', value: encerradas, topColor: '#ef4444', iconBg: '#fee2e2', delay: 140 },
        { icon: <IconDraft />, label: 'Rascunhos', value: rascunhos, topColor: '#94a3b8', iconBg: '#f1f5f9', delay: 210 },
    ];

    return (
        <>
            <style>{`
                @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes skeletonPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                .rel-row:hover td { background:#f8fafc !important; }
                .recharts-tooltip-cursor { fill: rgba(0,0,0,0.04) !important; }
                @media (max-width: 768px) {
                    .charts-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div style={{ width: '100%' }}>

                {/* ── Cabeçalho ── */}
                <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px' }}>Dashboard</h1>
                    <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Acompanhe o desempenho e os resultados das avaliações institucionais</p>
                </div>

                {/* ── StatCards ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16,
                    marginBottom: 32,
                    alignItems: 'stretch',
                }}>
                    {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
                </div>

                {/* ── Gráficos & Insights ── */}
                <div style={{ marginBottom: 32 }}>
                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                            <IconChart />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a202c' }}>Gráficos & Insights</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>Visualizações interativas dos dados de avaliação</div>
                        </div>
                    </div>

                    {/* Charts grid */}
                    <div className="charts-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 16,
                    }}>

                        {/* ── 1. Distribuição de Status (Donut) ── */}
                        <ChartCard
                            title="Distribuição por Status"
                            subtitle="Proporção de avaliações por status atual"
                            loading={loading}
                            delay={80}
                            minH={300}
                        >
                            {statusData.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sem dados para exibir</div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%', flexWrap: 'wrap' }}>
                                    <ResponsiveContainer width={180} height={180}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%" cy="50%"
                                                innerRadius={52}
                                                outerRadius={82}
                                                paddingAngle={3}
                                                dataKey="value"
                                                animationBegin={0}
                                                animationDuration={900}
                                            >
                                                {statusData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <DonutLegend data={statusData} />
                                </div>
                            )}
                        </ChartCard>

                        {/* ── 2. Avaliações por Ano (Bar) ── */}
                        <ChartCard
                            title="Avaliações por Ano"
                            subtitle="Tendência temporal de avaliações cadastradas"
                            loading={loading}
                            delay={130}
                            minH={300}
                        >
                            {anoData.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sem dados para exibir</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={anoData} margin={{ top: 4, right: 8, left: -8, bottom: 4 }} barCategoryGap="35%">
                                        <defs>
                                            <linearGradient id="barGradBlue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#60a5fa" />
                                                <stop offset="100%" stopColor="#3b82f6" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="ano"
                                            tick={{ fontSize: 12, fill: '#718096' }}
                                            axisLine={false} tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#718096' }}
                                            axisLine={false} tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            content={<ChartTooltip formatter={v => v + ' avaliação(ões)'} />}
                                            cursor={{ fill: 'rgba(59,130,246,0.06)', radius: 6 }}
                                        />
                                        <Bar dataKey="total" name="Avaliações" fill="url(#barGradBlue)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* ── 3. Avaliações por Modalidade ── */}
                        <ChartCard
                            title="Avaliações por Modalidade"
                            subtitle="Quantidade de avaliações por modalidade de ensino"
                            loading={loading}
                            delay={180}
                            minH={300}
                        >
                            {modalidadesData.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Sem dados de modalidade</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart
                                        data={modalidadesData}
                                        layout="vertical"
                                        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                                        barCategoryGap="30%"
                                    >
                                        <defs>
                                            <linearGradient id="barGradGreen" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#4caf50" />
                                                <stop offset="100%" stopColor="#2e7d32" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 12, fill: '#718096' }}
                                            axisLine={false} tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fontSize: 12, fill: '#4a5568' }}
                                            axisLine={false} tickLine={false}
                                            width={90}
                                        />
                                        <Tooltip
                                            content={<ChartTooltip formatter={v => v + ' avaliação(ões)'} />}
                                            cursor={{ fill: 'rgba(46,125,50,0.06)' }}
                                        />
                                        <Bar dataKey="total" name="Avaliações" fill="url(#barGradGreen)" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* ── 4. Progresso de Conclusão ── */}
                        <ChartCard
                            title="Taxa de Conclusão"
                            subtitle="Percentual de avaliações encerradas sobre o total"
                            loading={loading}
                            delay={230}
                            minH={300}
                        >
                            <CircularProgress
                                pct={progressPct}
                                total={total}
                                encerradas={encerradas}
                            />
                        </ChartCard>

                    </div>
                </div>

                {/* ── Search bar ── */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#fff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '10px 16px',
                        maxWidth: 420,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = '#1D5E24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,94,36,0.1)'; }}
                        onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar avaliações..."
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1a202c', width: '100%', fontFamily: 'inherit' }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        )}
                    </div>
                    {searchQuery && !loading && (
                        <p style={{ fontSize: 12, color: '#718096', marginTop: 6, marginLeft: 2 }}>
                            {filtered.length} resultado(s) para "{searchQuery}"
                        </p>
                    )}
                </div>

                {/* ── Tabela ── */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    overflowX: 'auto',
                    animation: 'fadeInUp 400ms 280ms both'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr>
                                {[['Código', ''], ['Modalidades', ''], ['Período', ''], ['Ano', ''], ['Início', ''], ['Fim', ''], ['Status', ''], ['Ação', 'right']].map(([h, align]) => (
                                    <th key={h} style={{ ...thStyle, textAlign: align || 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px', color: '#718096', fontSize: 14 }}>
                                    <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                                    {searchQuery ? `Nenhuma avaliação para "${searchQuery}".` : 'Nenhuma avaliação cadastrada.'}
                                </td></tr>
                            ) : filtered.map(av => (
                                <tr key={av.id} className="rel-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 150ms' }}>
                                    <td style={tdStyle}>
                                        <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: 5, border: '1px solid #e2e8f0', fontWeight: 600 }}>
                                            #{av.id}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {(av.modalidades || []).map((m, i) => (
                                                <span key={i} style={{ padding: '2px 8px', background: '#f1f5f9', color: '#4a5568', borderRadius: 9999, fontSize: 11, fontWeight: 500, border: '1px solid #e2e8f0' }}>{m.mod_ensino}</span>
                                            ))}
                                            {(!av.modalidades || av.modalidades.length === 0) && <span style={{ color: '#94a3b8' }}>—</span>}
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{av.periodo_letivo || '—'}</td>
                                    <td style={tdStyle}>{av.ano || '—'}</td>
                                    <td style={{ ...tdStyle, color: '#718096' }}>{fmt(av.data_inicio)}</td>
                                    <td style={{ ...tdStyle, color: '#718096' }}>{fmt(av.data_fim)}</td>
                                    <td style={tdStyle}><StatusBadge status={av.status} /></td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <button
                                            onClick={() => navigate(`/relatorio/${av.id}`)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: '#1D5E24', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#256428'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#1D5E24'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <IconEye /> Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    );
};

export default Relatorios;
