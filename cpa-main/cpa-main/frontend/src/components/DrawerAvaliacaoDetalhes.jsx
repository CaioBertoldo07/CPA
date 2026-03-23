import React, { useState, useEffect } from 'react';
import { useGetAvaliacaoByIdQuery } from '../hooks/queries/useAvaliacaoQueries';

/* ── helpers ──────────────────────────────────────────────────── */

const fmt = d => {
    if (!d) return '—';
    const datePart = String(d).split('T')[0];
    const date = new Date(datePart + 'T00:00:00');
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
};

const STATUS_MAP = {
    1: { label: 'Rascunho',  bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    2: { label: 'Enviada',   bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    3: { label: 'Encerrada', bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
};

/* ── icons ────────────────────────────────────────────────────── */

const IconCalendar = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IconFlag = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const IconLocation = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconExpand = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
);

const IconChevron = ({ open }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 220ms ease' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const IconMap = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
);

const IconBook = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

/* ── small UI atoms ───────────────────────────────────────────── */

const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
        {children}
    </div>
);

const Skeleton = ({ h = 16, w = '100%', mb = 8, radius = 6 }) => (
    <div style={{
        width: w, height: h, borderRadius: radius, marginBottom: mb,
        background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
        backgroundSize: '400% 100%', animation: 'skPulse 1.4s ease infinite',
    }} />
);

/* ── main component ───────────────────────────────────────────── */

const DrawerAvaliacaoDetalhes = ({ avaliacaoId, open, onClose }) => {
    const [questoesOpen, setQuestoesOpen] = useState(true);

    const { data: avaliacao, isLoading } = useGetAvaliacaoByIdQuery(avaliacaoId);

    /* reset accordion & lock scroll */
    useEffect(() => { if (open) setQuestoesOpen(true); }, [open]);
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    /* derived data */
    const modalidades = (avaliacao?.modalidades || []).map(m => m.mod_ensino).filter(Boolean).join(', ') || '—';
    const questoes    = avaliacao?.questoes || [];
    const cursos      = avaliacao?.cursos   || [];
    const unidades    = avaliacao?.unidade  || [];
    const municipios  = [...new Set(unidades.map(u => u.municipio_vinculo).filter(Boolean))];
    const status      = STATUS_MAP[avaliacao?.status] || STATUS_MAP[1];

    /* shared icon-button style */
    const iconBtn = (extra = {}) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 8,
        border: '1px solid #e2e8f0', background: '#fff',
        cursor: 'pointer', color: '#4a5568', transition: 'all 150ms',
        ...extra,
    });

    return (
        <>
            <style>{`
                @keyframes skPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
            `}</style>

            {/* ── Backdrop ── */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1200,
                    background: 'rgba(15,23,42,0.45)',
                    backdropFilter: 'blur(2px)',
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? 'all' : 'none',
                    transition: 'opacity 300ms ease',
                }}
            />

            {/* ── Drawer panel ── */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 460, zIndex: 1300,
                background: '#f8fafc',
                boxShadow: '-6px 0 40px rgba(0,0,0,0.16)',
                display: 'flex', flexDirection: 'column',
                transform: open ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
            }}>

                {/* ── Header ── */}
                <div style={{
                    padding: '16px 20px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fff', borderBottom: '1px solid #e2e8f0',
                }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>
                                Detalhes da Avaliação
                            </span>
                            {avaliacao && (
                                <>
                                    <span style={{
                                        fontFamily: 'monospace', background: '#f1f5f9',
                                        border: '1px solid #e2e8f0', borderRadius: 5,
                                        padding: '1px 7px', fontSize: 11, color: '#64748b',
                                    }}>
                                        #{avaliacao.id}
                                    </span>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        background: status.bg, color: status.color,
                                        border: `1px solid ${status.dot}55`,
                                        borderRadius: 9999, padding: '1px 8px', fontSize: 10, fontWeight: 700,
                                    }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: status.dot, display: 'inline-block' }} />
                                        {status.label}
                                    </span>
                                </>
                            )}
                        </div>
                        {isLoading ? (
                            <Skeleton h={11} w={140} mb={0} />
                        ) : (
                            <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                                {modalidades}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                        {/* Expand — opens full report in new tab */}
                        <button
                            onClick={() => window.open(`/relatorio/${avaliacaoId}`, '_blank')}
                            title="Abrir relatório completo"
                            style={iconBtn()}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                            <IconExpand />
                        </button>
                        {/* Close */}
                        <button
                            onClick={onClose}
                            title="Fechar"
                            style={iconBtn()}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#4a5568'; }}
                        >
                            <IconClose />
                        </button>
                    </div>
                </div>

                {/* ── Body (scrollable) ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 22 }}>

                    {isLoading ? (
                        <>
                            <Skeleton h={80} radius={10} />
                            <Skeleton h={130} radius={10} />
                            <Skeleton h={60}  radius={10} />
                            <Skeleton h={60}  radius={10} />
                            <Skeleton h={90}  radius={10} />
                        </>
                    ) : !avaliacao ? (
                        <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
                            Avaliação não encontrada.
                        </div>
                    ) : (
                        <>
                            {/* ── Metadados ── */}
                            <section>
                                <SectionTitle>Metadados</SectionTitle>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                                    {[
                                        { icon: <IconCalendar />, label: 'Período', value: avaliacao.periodo_letivo || '—', accent: '#3b82f6' },
                                        { icon: <IconCalendar />, label: 'Início',  value: fmt(avaliacao.data_inicio),         accent: '#10b981' },
                                        { icon: <IconFlag />,     label: 'Fim',     value: fmt(avaliacao.data_fim),            accent: '#f59e0b' },
                                    ].map(({ icon, label, value, accent }) => (
                                        <div key={label} style={{
                                            background: '#fff', border: '1px solid #e2e8f0',
                                            borderTop: `3px solid ${accent}`,
                                            borderRadius: 10, padding: '12px 14px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: accent, marginBottom: 7 }}>
                                                {icon}
                                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                                    {label}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ── Questões (accordion) ── */}
                            <section>
                                <button
                                    onClick={() => setQuestoesOpen(v => !v)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        width: '100%', padding: '10px 14px', cursor: 'pointer',
                                        background: '#fff', border: '1px solid #e2e8f0',
                                        borderRadius: questoesOpen ? '10px 10px 0 0' : 10,
                                        transition: 'background 150ms, border-radius 150ms',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                            Questões
                                        </span>
                                        <span style={{
                                            background: '#1D5E24', color: '#fff',
                                            borderRadius: 9999, fontSize: 10, fontWeight: 700, padding: '1px 7px',
                                        }}>
                                            {questoes.length}
                                        </span>
                                    </div>
                                    <IconChevron open={questoesOpen} />
                                </button>

                                {questoesOpen && (
                                    <div style={{
                                        background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none',
                                        borderRadius: '0 0 10px 10px', overflow: 'hidden',
                                    }}>
                                        {questoes.length === 0 ? (
                                            <div style={{ padding: '14px', fontSize: 12, color: '#94a3b8' }}>
                                                Nenhuma questão associada.
                                            </div>
                                        ) : questoes.map((q, i) => (
                                            <div key={q.id} style={{
                                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                                padding: '10px 14px',
                                                borderBottom: i < questoes.length - 1 ? '1px solid #f1f5f9' : 'none',
                                            }}>
                                                <span style={{
                                                    minWidth: 22, height: 22, borderRadius: '50%',
                                                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                                                    color: '#64748b', fontSize: 10, fontWeight: 700,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0, marginTop: 1,
                                                }}>
                                                    {i + 1}
                                                </span>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, color: '#1a202c', lineHeight: 1.55 }}>
                                                        {q.descricao}
                                                    </div>
                                                    {q.dimensoes?.nome && (
                                                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                                                            {q.dimensoes.nome}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* ── Cursos ── */}
                            {cursos.length > 0 && (
                                <section>
                                    <SectionTitle>Cursos ({cursos.length})</SectionTitle>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                        {cursos.map(c => (
                                            <span key={c.id} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                background: '#e8f5e9', color: '#1D5E24',
                                                border: '1px solid #a5d6a7',
                                                borderRadius: 9999, padding: '5px 12px',
                                                fontSize: 11, fontWeight: 500,
                                            }}>
                                                <IconBook />
                                                {c.nome}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ── Municípios ── */}
                            {municipios.length > 0 && (
                                <section>
                                    <SectionTitle>Municípios</SectionTitle>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                        {municipios.map(m => (
                                            <span key={m} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                background: '#f1f5f9', color: '#4a5568',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 9999, padding: '5px 12px',
                                                fontSize: 11, fontWeight: 500,
                                            }}>
                                                <IconLocation />
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ── Unidades / Campus ── */}
                            {unidades.length > 0 && (
                                <section>
                                    <SectionTitle>Unidades / Campus</SectionTitle>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {unidades.map(u => (
                                            <div key={u.id} style={{
                                                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                                                padding: '12px 14px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                                                transition: 'box-shadow 150ms',
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                            >
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c', marginBottom: 5 }}>
                                                        {u.nome}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                        {u.sigla?.trim() && (
                                                            <span style={{
                                                                fontFamily: 'monospace', background: '#f1f5f9',
                                                                border: '1px solid #e2e8f0', borderRadius: 4,
                                                                padding: '1px 6px', fontSize: 10, color: '#64748b',
                                                            }}>
                                                                {u.sigla.trim()}
                                                            </span>
                                                        )}
                                                        {u.municipio_vinculo && (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#718096' }}>
                                                                <IconLocation />
                                                                {u.municipio_vinculo}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Map placeholder */}
                                                <div style={{
                                                    width: 52, height: 52, borderRadius: 8, flexShrink: 0,
                                                    background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f5f9 100%)',
                                                    border: '1px solid #e2e8f0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <IconMap />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default DrawerAvaliacaoDetalhes;
