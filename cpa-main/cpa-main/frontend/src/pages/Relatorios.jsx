import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useGetAvaliacoesQuery } from '../hooks/queries/useAvaliacaoQueries';

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

const STATUS_MAP = {
    1: { label: 'Rascunho', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    2: { label: 'Enviada', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    3: { label: 'Encerrada', bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
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

// StatCard com altura fixa para todos ficarem iguais
const StatCard = ({ icon, label, value, topColor, iconBg, loading, delay = 0 }) => (
    <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        padding: '20px 20px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        position: 'relative', overflow: 'hidden',
        height: '100%',           // <-- garante mesma altura
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

const Relatorios = () => {
    const toast = useRef(null);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: avaliacoes = [],
        isLoading: loading,
        isError
    } = useGetAvaliacoesQuery();

    useEffect(() => {
        if (isError) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possível carregar as avaliações.',
                life: 4000
            });
        }
    }, [isError]);

    const total = avaliacoes.length;
    const enviadas = avaliacoes.filter(a => a.status === 2).length;
    const encerradas = avaliacoes.filter(a => a.status === 3).length;
    const rascunhos = avaliacoes.filter(a => a.status === 1).length;

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
            <Toast ref={toast} />
            <style>{`
                @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes skeletonPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                .rel-row:hover td { background:#f8fafc !important; }
            `}</style>

            <div style={{ maxWidth: 1200 }}>

                {/* ── Cabeçalho ── */}
                <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px' }}>Dashboard</h1>
                    <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Acompanhe o desempenho e os resultados das avaliações institucionais</p>
                </div>

                {/* ── StatCards: grid com 4 colunas iguais ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',   // 4 colunas sempre iguais
                    gap: 16,
                    marginBottom: 32,
                    alignItems: 'stretch',                   // mesma altura
                }}>
                    {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
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
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden', animation: 'fadeInUp 400ms 250ms both' }}>
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