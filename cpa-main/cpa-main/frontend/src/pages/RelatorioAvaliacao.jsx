// src/pages/RelatorioAvaliacao.js — VERSÃO CORRIGIDA (sem components/ui)
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Alert } from 'react-bootstrap';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useGetAvaliacaoByIdQuery } from '../hooks/queries/useAvaliacaoQueries';
import { useGetRespostasPorAvaliacaoQuery } from '../hooks/queries/useRespostaQueries';

const BAR_COLORS = ['#2e7d32', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

const SkeletonBlock = ({ w = '100%', h = 16 }) => (
    <div style={{
        width: w, height: h, borderRadius: 6,
        background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 37%,#f0f0f0 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeletonPulse 1.4s ease infinite',
    }} />
);

const fmt = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const agruparRespostas = (respostas = []) => {
    const mapa = {};
    for (const r of respostas) {
        const id = r.id_questao ?? r.questao?.id;
        if (!mapa[id]) {
            mapa[id] = {
                descricao: r.questao?.descricao ?? `Questão ${id}`,
                dimensao: r.questao?.dimensao?.nome ?? '—',
                eixo: r.questao?.dimensao?.eixo?.nome ?? '—',
                total: 0, alternativas: {},
            };
        }
        mapa[id].total += 1;
        const alt = r.alternativa?.descricao ?? r.resposta ?? 'Sem resposta';
        mapa[id].alternativas[alt] = (mapa[id].alternativas[alt] || 0) + 1;
    }
    return Object.values(mapa);
};

// ── Tooltip do gráfico ──
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '8px 14px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.09)', fontSize: 13,
        }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{payload[0]?.payload?.name}</p>
            <p style={{ margin: '2px 0', color: payload[0]?.fill }}>
                {payload[0]?.value} resp. ({payload[0]?.payload?.pct}%)
            </p>
        </div>
    );
};

// ── Card de questão ──
const QuestaoCard = ({ questao, idx }) => {
    const entries = Object.entries(questao.alternativas);
    const chartData = entries.map(([alt, count]) => ({
        name: alt, value: count,
        pct: questao.total > 0 ? Math.round((count / questao.total) * 100) : 0,
    }));

    return (
        <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderLeft: '3px solid #4caf50',
            borderRadius: 14,
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
            padding: 20,
            marginBottom: 16,
            animation: `fadeInUp 400ms ${idx * 60}ms both`,
        }}>
            {/* Cabeçalho */}
            <p style={{
                fontSize: 14, fontWeight: 600, color: '#1a202c',
                margin: '0 0 8px', lineHeight: 1.5,
                overflowWrap: 'break-word', wordBreak: 'break-word',
            }}>
                {questao.descricao}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {questao.eixo !== '—' && (
                    <span style={{ padding: '2px 9px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 9999, fontSize: 11, fontWeight: 500, border: '1px solid #a5d6a7' }}>
                        {questao.eixo}
                    </span>
                )}
                {questao.dimensao !== '—' && (
                    <span style={{ padding: '2px 9px', background: '#f1f5f9', color: '#4a5568', borderRadius: 9999, fontSize: 11, fontWeight: 500, border: '1px solid #e2e8f0' }}>
                        {questao.dimensao}
                    </span>
                )}
                <span style={{ padding: '2px 9px', background: '#f1f5f9', color: '#4a5568', borderRadius: 9999, fontSize: 11, border: '1px solid #e2e8f0' }}>
                    {questao.total} resp.
                </span>
            </div>

            <Row>
                {/* Gráfico de barras */}
                <Col md={6} style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                        Distribuição
                    </p>
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -22, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Col>

                {/* Progress bars */}
                <Col md={6}>
                    <p style={{ fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                        Detalhamento
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {chartData.map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, color: '#4a5568', fontWeight: 500 }}>{item.name}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: BAR_COLORS[i % BAR_COLORS.length] }}>
                                        {item.pct}% <span style={{ color: '#718096', fontWeight: 400 }}>({item.value})</span>
                                    </span>
                                </div>
                                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 9999,
                                        width: `${item.pct}%`,
                                        background: BAR_COLORS[i % BAR_COLORS.length],
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

// ── StatCard ──
const StatCard = ({ icon, label, value, topColor, iconBg, loading, delay = 0 }) => (
    <div style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
        padding: '20px 24px',
        display: 'flex', alignItems: 'flex-start', gap: 14,
        position: 'relative', overflow: 'hidden',
        animation: `fadeInUp 400ms ${delay}ms both`,
    }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: topColor, borderRadius: '14px 14px 0 0' }} />
        <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
            {icon}
        </div>
        <div>
            {loading
                ? <div style={{ width: 60, height: 28, borderRadius: 6, background: '#e0e0e0' }} />
                : <div style={{ fontSize: 28, fontWeight: 700, color: '#1a202c', lineHeight: 1, marginBottom: 4 }}>{value}</div>
            }
            <div style={{ fontSize: 13, color: '#718096', fontWeight: 500 }}>{label}</div>
        </div>
    </div>
);

const RelatorioAvaliacao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useRef(null);

    const {
        data: avaliacao,
        isLoading: loadingAvaliacao,
        isError: isErrorAvaliacao
    } = useGetAvaliacaoByIdQuery(id);

    const {
        data: respostas = [],
        isLoading: loadingRespostas,
        isError: isErrorRespostas
    } = useGetRespostasPorAvaliacaoQuery(id);

    const errorAvaliacao = isErrorAvaliacao ? 'Erro ao carregar dados da avaliação.' : '';
    const errorRespostas = isErrorRespostas ? 'Erro ao carregar respostas.' : '';

    const questoesAgrupadas = agruparRespostas(respostas);

    if (loadingAvaliacao) return (
        <>
            <div className="container" style={{ paddingTop: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
                    <SkeletonBlock h={32} w="50%" />
                    <SkeletonBlock h={16} w="35%" />
                    <SkeletonBlock h={120} />
                    <SkeletonBlock h={120} />
                </div>
            </div>
        </>
    );

    if (errorAvaliacao) return (
        <>
            <div className="container" style={{ paddingTop: 32 }}>
                <Alert variant="danger">
                    <Alert.Heading>Erro</Alert.Heading>
                    <p>{errorAvaliacao}</p>
                    <button onClick={() => navigate('/relatorios')} style={{ padding: '6px 16px', background: 'transparent', border: '1.5px solid #dc3545', color: '#dc3545', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                        ← Voltar
                    </button>
                </Alert>
            </div>
        </>
    );

    return (
        <>
            <Toast ref={toast} />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes skeletonPulse {
                    0%   { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#718096', marginBottom: 24 }}>
                    <button onClick={() => navigate('/relatorios')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'transparent', color: '#4a5568', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, transition: 'background 150ms' }}
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
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a202c', margin: '0 0 4px', lineHeight: 1.25 }}>
                            Dashboard Avaliação #{avaliacao?.id}
                        </h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                            Período: {avaliacao?.periodo_letivo || '—'} · Ano: {avaliacao?.ano || '—'}
                        </p>
                    </div>
                    <StatusBadge status={avaliacao?.status} />
                </div>

                {/* Card de informações */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.07)', padding: 24, marginBottom: 24, animation: 'fadeInUp 400ms 80ms both' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 16 }}>
                        Informações da Avaliação
                    </p>
                    <Row className="g-4">
                        <Col xs={6} md={3}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 3 }}>Data de início</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a202c' }}>{fmt(avaliacao?.data_inicio)}</div>
                            </div>
                        </Col>
                        <Col xs={6} md={3}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 3 }}>Data de fim</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a202c' }}>{fmt(avaliacao?.data_fim)}</div>
                            </div>
                        </Col>
                        <Col xs={12} md={3}>
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
                        </Col>
                        <Col xs={12} md={3}>
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
                        </Col>
                    </Row>
                </div>

                {/* Métricas */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 16,
                    marginBottom: 32,
                    maxWidth: 480,
                }}>
                    <StatCard
                        icon="📊"
                        label="Total de Respostas"
                        value={respostas.length}
                        topColor="#2e7d32"
                        iconBg="#e8f5e9"
                        loading={loadingRespostas}
                        delay={0}
                    />
                    <StatCard
                        icon="✅"
                        label="Questões Respondidas"
                        value={questoesAgrupadas.length}
                        topColor="#3b82f6"
                        iconBg="#dbeafe"
                        loading={loadingRespostas}
                        delay={80}
                    />
                </div>

                {/* Questões */}
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#718096', marginBottom: 16 }}>
                    Respostas por Questão
                </p>

                {loadingRespostas ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <SkeletonBlock h={14} w="40%" />
                                <SkeletonBlock h={100} />
                            </div>
                        ))}
                    </div>
                ) : errorRespostas ? (
                    <Alert variant="warning"><strong>Atenção:</strong> {errorRespostas}</Alert>
                ) : questoesAgrupadas.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center', color: '#718096' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                        <p style={{ margin: 0, fontSize: 14 }}>Esta avaliação ainda não possui respostas registradas.</p>
                    </div>
                ) : (
                    questoesAgrupadas.map((q, idx) => <QuestaoCard key={idx} questao={q} idx={idx} />)
                )}
            </div>
        </>
    );
};

export default RelatorioAvaliacao;