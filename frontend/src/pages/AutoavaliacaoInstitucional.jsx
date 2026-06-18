import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import cpaLogo from '../assets/imgs/cpa_logo.svg';
// TODO: adicionar uea-new.png e governodoamazonas.png em assets/imgs/
const ueaLogo = null;
const amLogo = null;
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { MdOutlineFileDownload, MdOutlineAssessment, MdOutlineFilterList } from 'react-icons/md';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useGetAvaliacoesQuery } from '../hooks/queries/useAvaliacaoQueries';
import { useGetRespostasPorAvaliacaoQuery } from '../hooks/queries/useRespostaQueries';
import { useGetCurrentUserQuery } from '../hooks/queries/useAuthQueries';

// ─── Palette ──────────────────────────────────────────────────────────────────
const UEA_GREEN = '#1D5E24';

const ALT_COLORS = {
    'Sim': '#16a34a',
    'Não': '#dc2626',
    'Não sei responder': '#94a3b8',
    'Ótimo': '#16a34a',
    'Bom': '#3b82f6',
    'Regular': '#f59e0b',
    'Insuficiente': '#dc2626',
    'Todos.': '#16a34a',
    'Todos': '#16a34a',
    'Alguns': '#f59e0b',
    'Nenhum': '#dc2626',
    'Alta': '#16a34a',
    'Média': '#f59e0b',
    'Baixa': '#dc2626',
    'Concordo': '#16a34a',
    'Neutro': '#94a3b8',
    'Discordo': '#dc2626',
};
const FALLBACK_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function altColor(alt, idx) {
    return ALT_COLORS[alt] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

function fmtPct(value) {
    const n = parseFloat(value);
    return isNaN(n) ? '—' : n.toFixed(2).replace('.', ',') + '%';
}

function sortByNumero(obj) {
    return Object.entries(obj || {}).sort(([, a], [, b]) => (a.numero ?? 0) - (b.numero ?? 0));
}

// ─── CoverPage ────────────────────────────────────────────────────────────────
function CoverPage({ curso, unidade, periodo, ano }) {
    const periodoDisplay = (periodo || '').replace('.', '/');

    return (
        <div data-pdf-cover="" style={{
            width: '100%',
            paddingBottom: '141.42%', // A4: 297/210
            position: 'relative',
            overflow: 'hidden',
            background: '#fff',
            fontFamily: 'inherit',
        }}>
            <div style={{ position: 'absolute', inset: 0 }}>


                {/* ── Faixa verde lateral esquerda (topo) ── */}
                <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '1.2%', height: '100%',
                    background: 'linear-gradient(180deg, #1D5E24 0%, #2d7a34 60%, transparent 100%)',
                    opacity: 0.6,
                }} />

                {/* ── Logos UEA + Governo AM — superior esquerdo ── */}
                <div style={{
                    position: 'absolute', top: '4%', left: '6%',
                    display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 24px)',
                }}>
                    <img
                        src={ueaLogo}
                        alt="UEA"
                        style={{ height: 'clamp(50px, 8vw, 90px)', width: 'auto', objectFit: 'contain' }}
                    />
                    <img
                        src={amLogo}
                        alt="Governo do Amazonas"
                        style={{ height: 'clamp(50px, 8vw, 90px)', width: 'auto', objectFit: 'contain' }}
                    />
                </div>

                {/* ── Padrão de pontos decorativo (centro) ── */}
                <div style={{
                    position: 'absolute', top: '20%', left: '5%', right: '5%',
                    height: '30%',
                    backgroundImage: 'radial-gradient(circle, #1D5E24 1px, transparent 1px)',
                    backgroundSize: '18px 18px',
                    opacity: 0.06,
                    borderRadius: 8,
                }} />

                {/* ── Título principal ── */}
                <div style={{
                    position: 'absolute', top: '42%', left: '7%', right: '7%',
                }}>
                    <div style={{
                        fontSize: 'clamp(22px, 6vw, 64px)',
                        fontWeight: 900,
                        color: '#1D5E24',
                        letterSpacing: '-0.5px',
                        lineHeight: 1.05,
                        marginBottom: '2.5%',
                    }}>
                        RELATÓRIO CPA/UEA
                    </div>
                    <div style={{
                        fontSize: 'clamp(13px, 2.8vw, 30px)',
                        fontWeight: 600,
                        color: '#2d7a34',
                        letterSpacing: '0.3px',
                    }}>
                        Autoavaliação Institucional — {periodoDisplay}
                    </div>
                </div>

                {/* ── Linha separadora ── */}
                <div style={{
                    position: 'absolute', bottom: '28%', left: '7%', right: '7%',
                    height: 2,
                    background: 'linear-gradient(90deg, #1D5E24 0%, #86efac 60%, transparent 100%)',
                    opacity: 0.35,
                }} />

                {/* ── Info curso — inferior esquerda ── */}
                <div style={{ position: 'absolute', bottom: '10%', left: '7%' }}>
                    <div style={{
                        fontSize: 'clamp(9px, 1.4vw, 14px)',
                        fontWeight: 700,
                        color: '#1D5E24',
                        marginBottom: '1%',
                        letterSpacing: '0.3px',
                    }}>
                        Discentes Cursos Regulares
                    </div>
                    <div style={{
                        fontSize: 'clamp(9px, 1.5vw, 15px)',
                        fontWeight: 700,
                        color: '#1a202c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        lineHeight: 1.3,
                    }}>
                        {unidade && <>{unidade}<br /></>}
                        {curso || 'Todos os cursos'}
                    </div>
                </div>

                {/* ── Logo CPA + CPA/AM — inferior direito ── */}
                <div style={{
                    position: 'absolute', bottom: '8%', right: '6%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px, 1vw, 12px)',
                }}>
                    <img
                        src={cpaLogo}
                        alt="CPA"
                        style={{ height: 'clamp(55px, 9vw, 105px)', width: 'auto', objectFit: 'contain' }}
                    />
                    <div style={{
                        fontSize: 'clamp(11px, 1.9vw, 20px)',
                        fontWeight: 700, color: '#1a202c',
                        textAlign: 'center', letterSpacing: '0.5px',
                    }}>
                        CPA/AM — {new Date().getFullYear()}
                    </div>
                </div>

                {/* ── Blocos decorativos cantos inferiores ── */}
                <div style={{
                    position: 'absolute', bottom: 0, right: 0,
                    display: 'flex', alignItems: 'flex-end', gap: 0,
                }}>
                    {[{ h: '18%', op: 0.55 }, { h: '12%', op: 0.4 }, { h: '8%', op: 0.3 }].map((b, i) => (
                        <div key={i} style={{
                            width: 'clamp(20px, 3vw, 36px)',
                            height: b.h,
                            background: '#1D5E24',
                            opacity: b.op,
                        }} />
                    ))}
                </div>
                <div style={{
                    position: 'absolute', bottom: 0, left: 0,
                    display: 'flex', alignItems: 'flex-end', gap: 0,
                }}>
                    {[{ h: '5%', op: 0.2 }, { h: '8%', op: 0.3 }, { h: '12%', op: 0.4 }].map((b, i) => (
                        <div key={i} style={{
                            width: 'clamp(20px, 3vw, 36px)',
                            height: b.h,
                            background: '#2d7a34',
                            opacity: b.op,
                        }} />
                    ))}
                </div>

            </div>
        </div>
    );
}

// ─── PieWidget — Canvas 2D API (100% compatível com html2canvas) ─────────────
function PieWidget({ respostas, alternativas, size = 170 }) {
    const canvasRef = useRef(null);

    const data = alternativas
        .map((alt, i) => ({
            name: alt,
            value: parseFloat(respostas?.[alt]?.porcentagem ?? 0),
            color: altColor(alt, i),
        }))
        .filter(d => d.value > 0.01);

    // useLayoutEffect garante que o canvas já está pintado antes do html2canvas capturar
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data.length) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);

        const cx = size / 2;
        const cy = size / 2;
        const outerR = size * 0.44;
        const innerR = size * 0.27;
        const GAP = data.length > 1 ? 0.03 : 0;

        let startAngle = -Math.PI / 2;

        data.forEach(seg => {
            const slice = (seg.value / 100) * 2 * Math.PI;
            const s = startAngle + GAP / 2;
            const e = startAngle + slice - GAP / 2;
            if (e <= s) { startAngle += slice; return; }

            ctx.beginPath();
            ctx.arc(cx, cy, outerR, s, e);
            ctx.arc(cx, cy, innerR, e, s, true);
            ctx.closePath();
            ctx.fillStyle = seg.color;
            ctx.fill();

            startAngle += slice;
        });
    }, [data, size]);

    if (!data.length) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Sem respostas</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{ flexShrink: 0, display: 'block' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                            width: 12, height: 12, borderRadius: '50%',
                            background: entry.color, flexShrink: 0,
                        }} />
                        <div style={{ lineHeight: 1.3 }}>
                            <span style={{ fontSize: 18, fontWeight: 700, color: '#1a202c' }}>
                                {fmtPct(entry.value)}
                            </span>
                            <br />
                            <span style={{ fontSize: 11, color: '#64748b' }}>{entry.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── SummaryTable ─────────────────────────────────────────────────────────────
function SummaryTable({ rows, alternativas, noMargin = false }) {
    if (!rows.length) return null;
    return (
        <div style={{ overflowX: 'auto', marginTop: noMargin ? 0 : 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                    <tr style={{ background: '#f8fafc' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', border: '1px solid #e2e8f0', minWidth: 200 }}>
                            Questão
                        </th>
                        {alternativas.map(alt => (
                            <th key={alt} style={{ textAlign: 'center', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                                {alt}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '8px 12px', color: '#374151', fontSize: 12, border: '1px solid #e2e8f0', lineHeight: 1.4 }}>
                                <span style={{ fontWeight: 700, color: UEA_GREEN, marginRight: 6 }}>{row.codigo}</span>
                                {row.label}
                            </td>
                            {alternativas.map((alt, ai) => {
                                const pct = parseFloat(row.respostas?.[alt]?.porcentagem ?? 0);
                                return (
                                    <td key={alt} style={{
                                        textAlign: 'center', padding: '8px 12px',
                                        border: '1px solid #e2e8f0',
                                        fontWeight: 600,
                                        color: pct > 0 ? altColor(alt, ai) : '#d1d5db',
                                    }}>
                                        {pct > 0 ? fmtPct(pct) : '—'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── QuestaoCard (tipo 1 — múltipla escolha) ──────────────────────────────────
function QuestaoCard({ questao, codigo, alternativas }) {
    const rows = [{ codigo, label: questao.descricao, respostas: questao.respostas }];
    return (
        <div data-pdf-block="" style={{
            background: '#fff', border: '1px solid #e8eff5', borderRadius: 10,
            padding: '18px 20px', marginBottom: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 18px', lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, color: UEA_GREEN, marginRight: 6 }}>{codigo}</span>
                {questao.descricao}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PieWidget respostas={questao.respostas} alternativas={alternativas} size={170} />
            </div>
        </div>
    );
}

// ─── GradeQuestaoCard (tipo 2 — grade) ───────────────────────────────────────
function GradeQuestaoCard({ questao, codigo, alternativas }) {
    const adicionais = Object.entries(questao.adicionais || {});
    if (!adicionais.length) return null;

    const LABELS = 'abcdefghijklmnopqrstuvwxyz';
    const rows = adicionais.map(([nome, data], i) => ({
        codigo: `${LABELS[i] || i}.`,
        label: nome,
        respostas: data.respostas,
    }));

    return (
        <div data-pdf-block="" style={{
            background: '#fff', border: '1px solid #e8eff5', borderRadius: 10,
            padding: '18px 20px', marginBottom: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 18px', lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, color: UEA_GREEN, marginRight: 6 }}>{codigo}</span>
                {questao.descricao}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}>
                {rows.map((row, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '12px 0', width: '100%',
                        borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : 'none',
                        justifyContent: 'center',
                    }}>
                        <div style={{ width: 180, flexShrink: 0 }}>
                            <span style={{ fontWeight: 700, color: UEA_GREEN, marginRight: 6, fontSize: 12 }}>
                                {row.codigo}
                            </span>
                            <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>
                                {row.label}
                            </span>
                        </div>
                        <PieWidget respostas={row.respostas} alternativas={alternativas} size={130} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── TabelasFinais ───────────────────────────────────────────────────────────
function TabelasFinais({ eixos }) {
    const LABELS = 'abcdefghijklmnopqrstuvwxyz';

    return (
        <div style={{ marginTop: 8 }}>
            {/* Cabeçalho da seção — tratado como "eixo" para forçar nova página */}
            <div data-pdf-block="eixo" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#1a202c', borderRadius: '10px 10px 0 0',
                padding: '14px 18px', color: '#fff',
            }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.3px' }}>
                    Tabelas de Resultados
                </span>
            </div>

            <div style={{
                border: '1px solid #e2e8f0', borderTop: 'none',
                borderRadius: '0 0 10px 10px', background: '#fafbfc',
                padding: '20px 18px',
            }}>
                {eixos.map(([eixoKey, eixo]) => (
                    <div key={eixoKey} style={{ marginBottom: 24 }}>
                        {/* Eixo header */}
                        <div data-pdf-block="" style={{
                            background: UEA_GREEN, color: '#fff',
                            borderRadius: 8, padding: '8px 14px',
                            fontSize: 13, fontWeight: 700,
                            marginBottom: 12,
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <span style={{
                                background: 'rgba(255,255,255,0.18)', borderRadius: 5,
                                padding: '1px 8px', fontSize: 11, fontWeight: 700,
                            }}>
                                EIXO {eixo.numero}
                            </span>
                            {eixo.nome}
                        </div>

                        {sortByNumero(eixo.dimensoes).map(([dimKey, dimensao]) => (
                            <div key={dimKey} style={{ marginBottom: 16 }}>
                                {/* Dimensão header */}
                                <div style={{
                                    fontSize: 12, fontWeight: 600, color: '#166534',
                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    borderRadius: 6, padding: '6px 12px',
                                    marginBottom: 8,
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <span style={{
                                        background: UEA_GREEN, color: '#fff',
                                        borderRadius: 4, padding: '1px 7px',
                                        fontSize: 11, fontWeight: 700,
                                    }}>
                                        {eixo.numero}.{dimensao.numero}
                                    </span>
                                    {dimensao.nome}
                                </div>

                                {dimensao.questoes.map((questao, qIdx) => {
                                    const codigo = `${eixo.numero}.${dimensao.numero}-${qIdx + 1}.`;

                                    if (questao.tipo === 2) {
                                        const firstAdicional = Object.values(questao.adicionais || {})[0];
                                        const alts = firstAdicional ? Object.keys(firstAdicional.respostas || {}) : [];
                                        const rows = Object.entries(questao.adicionais).map(([nome, data], i) => ({
                                            codigo: `${LABELS[i] || i}.`,
                                            label: nome,
                                            respostas: data.respostas,
                                        }));
                                        return (
                                            <div data-pdf-block="" key={questao.id_avaliacao_questoes} style={{
                                                marginBottom: 12, border: '1px solid #e2e8f0',
                                                borderRadius: 8, overflow: 'hidden',
                                            }}>
                                                <p style={{
                                                    fontSize: 12, color: '#374151',
                                                    margin: 0, lineHeight: 1.5,
                                                    padding: '10px 12px',
                                                    background: '#f8fafc',
                                                    borderBottom: '1px solid #e2e8f0',
                                                }}>
                                                    <span style={{ fontWeight: 700, color: UEA_GREEN, marginRight: 5 }}>{codigo}</span>
                                                    {questao.descricao}
                                                </p>
                                                <SummaryTable rows={rows} alternativas={alts} noMargin />
                                            </div>
                                        );
                                    }

                                    const alts = Object.keys(questao.respostas || {});
                                    const rows = [{ codigo, label: questao.descricao, respostas: questao.respostas }];
                                    return (
                                        <div data-pdf-block="" key={questao.id_avaliacao_questoes} style={{ marginBottom: 12 }}>
                                            <SummaryTable rows={rows} alternativas={alts} />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── DimensaoSection ─────────────────────────────────────────────────────────
function DimensaoSection({ eixoNumero, dimensao }) {
    const questoes = dimensao.questoes || [];
    return (
        <div style={{ marginBottom: 22 }}>
            <div data-pdf-block="" style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <span style={{
                    background: UEA_GREEN, color: '#fff', borderRadius: 6,
                    padding: '2px 9px', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.3px', flexShrink: 0,
                }}>
                    {eixoNumero}.{dimensao.numero}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>
                    {dimensao.nome}
                </span>
            </div>

            {questoes.map((questao, qIdx) => {
                const codigo = `${eixoNumero}.${dimensao.numero}-${qIdx + 1}.`;

                if (questao.tipo === 2) {
                    const firstAdicional = Object.values(questao.adicionais || {})[0];
                    const alts = firstAdicional ? Object.keys(firstAdicional.respostas || {}) : [];
                    return (
                        <GradeQuestaoCard
                            key={questao.id_avaliacao_questoes}
                            questao={questao}
                            codigo={codigo}
                            alternativas={alts}
                        />
                    );
                }

                const alts = Object.keys(questao.respostas || {});
                return (
                    <QuestaoCard
                        key={questao.id_avaliacao_questoes}
                        questao={questao}
                        codigo={codigo}
                        alternativas={alts}
                    />
                );
            })}
        </div>
    );
}

// ─── EixoHeader (compartilhado entre Accordion e Flat) ───────────────────────
function EixoHeader({ eixo, totalQuestoes }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: UEA_GREEN, borderRadius: '10px 10px 0 0',
            padding: '14px 18px', color: '#fff',
        }}>
            <span style={{
                background: 'rgba(255,255,255,0.18)', borderRadius: 6,
                padding: '2px 10px', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
                EIXO {eixo.numero}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{eixo.nome}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.75 }}>
                {totalQuestoes} {totalQuestoes !== 1 ? 'questões' : 'questão'}
            </span>
        </div>
    );
}

// ─── EixoAccordion (modo normal — interativo) ─────────────────────────────────
function EixoAccordion({ eixoKey, eixo, defaultExpanded }) {
    const dimensoes = sortByNumero(eixo.dimensoes);
    const totalQuestoes = dimensoes.reduce((sum, [, d]) => sum + (d.questoes?.length || 0), 0);

    return (
        <Accordion
            defaultExpanded={defaultExpanded}
            sx={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px !important',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                marginBottom: '12px',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { marginBottom: '12px' },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                sx={{
                    background: UEA_GREEN,
                    borderRadius: '10px 10px 0 0',
                    color: '#fff',
                    minHeight: '52px !important',
                    '&.Mui-expanded': { borderRadius: '10px 10px 0 0', minHeight: '52px !important' },
                    '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 10, my: '14px !important' },
                }}
            >
                <span style={{
                    background: 'rgba(255,255,255,0.18)', borderRadius: 6,
                    padding: '2px 10px', fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                    EIXO {eixo.numero}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{eixo.nome}</span>
                <span style={{ marginLeft: 'auto', marginRight: 4, fontSize: 11, opacity: 0.75 }}>
                    {totalQuestoes} {totalQuestoes !== 1 ? 'questões' : 'questão'}
                </span>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '20px 18px', background: '#fafbfc' }}>
                {dimensoes.map(([dimKey, dimensao]) => (
                    <DimensaoSection key={dimKey} eixoNumero={eixo.numero} dimensao={dimensao} />
                ))}
            </AccordionDetails>
        </Accordion>
    );
}

// ─── EixoFlat (modo PDF — sem animações, tudo visível) ────────────────────────
function EixoFlat({ eixoKey, eixo }) {
    const dimensoes = sortByNumero(eixo.dimensoes);
    const totalQuestoes = dimensoes.reduce((sum, [, d]) => sum + (d.questoes?.length || 0), 0);

    return (
        <div style={{
            border: '1px solid #e2e8f0', borderRadius: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12, overflow: 'hidden',
        }}>
            <div data-pdf-block="eixo"><EixoHeader eixo={eixo} totalQuestoes={totalQuestoes} /></div>
            <div style={{ padding: '20px 18px', background: '#fafbfc' }}>
                {dimensoes.map(([dimKey, dimensao]) => (
                    <DimensaoSection key={dimKey} eixoNumero={eixo.numero} dimensao={dimensao} />
                ))}
            </div>
        </div>
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sublabel, accent = UEA_GREEN }) {
    return (
        <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
            padding: '18px 22px', flex: 1, minWidth: 150,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderTop: `3px solid ${accent}`,
        }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 2px', lineHeight: 1.2 }}>{value}</p>
            {sublabel && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{sublabel}</p>}
        </div>
    );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 340, background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            gap: 8,
        }}>
            <div style={{ color: '#cbd5e1', marginBottom: 8 }}>{icon}</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', margin: 0 }}>{title}</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, textAlign: 'center', maxWidth: 360 }}>{subtitle}</p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const AutoavaliacaoInstitucional = () => {
    const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState('');
    const [selectedCurso, setSelectedCurso] = useState('');
    const [exporting, setExporting] = useState(false);
    const [exportMode, setExportMode] = useState(false);
    const reportRef = useRef(null);

    const avaliacaoIdNum = selectedAvaliacaoId ? parseInt(selectedAvaliacaoId, 10) : null;

    // Avaliações para o seletor
    const { data: currentUser } = useGetCurrentUserQuery();
    const { data: avaliacoesResp, isLoading: loadingAval } = useGetAvaliacoesQuery({ pageSize: 100 });
    // avaliacoesResp já é o body da API (interceptor axios desembrulha response.data)
    // body = { data: [...], meta: {...} }
    const avaliacoes = avaliacoesResp?.data ?? [];

    // Relatório base (sem filtro de curso) → para popular o seletor de cursos
    const { data: baseResp, isLoading: loadingBase } = useGetRespostasPorAvaliacaoQuery(
        avaliacaoIdNum,
        {}
    );
    // baseResp já é o body da API: { totalAvaliadores, relatorio, participacao }
    const baseReport = baseResp ?? null;

    // Cursos disponíveis com base nas respostas existentes
    const availableCursos = useMemo(() => {
        const cursosMap = baseReport?.participacao?.curso ?? {};
        return Object.keys(cursosMap).sort();
    }, [baseReport]);

    // Relatório filtrado por curso (só busca quando um curso está selecionado)
    const { data: filteredResp, isLoading: loadingFiltered } = useGetRespostasPorAvaliacaoQuery(
        selectedCurso ? avaliacaoIdNum : null,
        selectedCurso ? { curso: selectedCurso } : {}
    );

    const activeReport = selectedCurso ? (filteredResp ?? null) : baseReport;
    const isLoadingReport = loadingBase || (selectedCurso && loadingFiltered);

    const selectedAvaliacao = avaliacoes.find(a => a.id === avaliacaoIdNum);
    const respondentes = activeReport?.totalAvaliadores ?? 0;

    const eixos = useMemo(() => sortByNumero(activeReport?.relatorio), [activeReport]);

    // ── PDF Export ────────────────────────────────────────────────────────────
    const handleExportPDF = async () => {
        if (!reportRef.current || exporting) return;
        setExporting(true);
        setExportMode(true);
        await new Promise(resolve => setTimeout(resolve, 80));

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const PAGE_W = 210;
            const PAGE_H = 297;
            const MARGIN = 8;
            const CONTENT_W = PAGE_W - MARGIN * 2;
            const SCALE = 2;

            const capture = async (el) => {
                const canvas = await html2canvas(el, {
                    scale: SCALE, useCORS: true, logging: false,
                    backgroundColor: '#ffffff',
                });
                const hMm = (canvas.height * CONTENT_W) / canvas.width;
                return { img: canvas.toDataURL('image/png'), hMm };
            };

            const root = reportRef.current;

            // 1. Capa — página inteira sem margens
            const coverEl = root.querySelector('[data-pdf-cover]');
            if (coverEl) {
                const canvas = await html2canvas(coverEl, {
                    scale: SCALE, useCORS: true, logging: false, backgroundColor: '#ffffff',
                });
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W, PAGE_H);
                pdf.addPage();
            }

            // 2. Stats
            let currentY = MARGIN;
            const statsEl = root.querySelector('[data-pdf-stats]');
            if (statsEl) {
                const { img, hMm } = await capture(statsEl);
                pdf.addImage(img, 'PNG', MARGIN, currentY, CONTENT_W, hMm);
                currentY += hMm + 4;
            }

            // 3. Blocos individuais (eixo header, dimensão header, questão card)
            const blocks = Array.from(root.querySelectorAll('[data-pdf-block]'));
            let firstEixo = true;

            for (const block of blocks) {
                const { img, hMm } = await capture(block);
                const isEixo = block.dataset.pdfBlock === 'eixo';

                if (isEixo && !firstEixo) {
                    // 2º eixo em diante → sempre nova página
                    pdf.addPage();
                    currentY = MARGIN;
                } else if (currentY + hMm > PAGE_H - MARGIN) {
                    // qualquer bloco que não cabe → nova página
                    pdf.addPage();
                    currentY = MARGIN;
                }

                if (isEixo) firstEixo = false;

                pdf.addImage(img, 'PNG', MARGIN, currentY, CONTENT_W, hMm);
                currentY += hMm + 2;
            }

            // ── Rodapé em todas as páginas menos a capa ──────────────────────
            const userName = currentUser?.nome || currentUser?.email || 'Administrador';
            const hoje = new Date();
            const dataFormatada = `${String(hoje.getDate()).padStart(2,'0')}/${String(hoje.getMonth()+1).padStart(2,'0')}/${hoje.getFullYear()}`;
            const footerText = `Relatório gerado por ${userName} em ${dataFormatada}`;
            const totalPaginas = pdf.getNumberOfPages();
            for (let p = 2; p <= totalPaginas; p++) {
                pdf.setPage(p);
                pdf.setFontSize(7);
                pdf.setTextColor(160, 160, 160);
                pdf.text(footerText, PAGE_W / 2, PAGE_H - 4, { align: 'center' });
            }

            const periodo = selectedAvaliacao?.periodo_letivo?.replace('.', '-') ?? 'relatorio';
            const curso = (selectedCurso || 'todos').replace(/\s+/g, '_').substring(0, 40);
            pdf.save(`Autoavaliacao_${periodo}_${curso}.pdf`);
        } finally {
            setExportMode(false);
            setExporting(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div style={{ width: '100%', maxWidth: '1400px', animation: 'fadeInUp 400ms both' }}>

                {/* ── Page Header ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 16, marginBottom: 24,
                    paddingBottom: 20, borderBottom: '1px solid #e2e8f0',
                }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px' }}>
                            Autoavaliação Institucional
                        </h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                            Relatório de resultados por curso — resultados das avaliações CPA
                        </p>
                    </div>

                    {respondentes > 0 && (
                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                background: exporting ? '#6b7280' : UEA_GREEN,
                                color: '#fff', border: 'none', borderRadius: 9,
                                padding: '9px 18px', fontSize: 13, fontWeight: 600,
                                cursor: exporting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 6px rgba(29,94,36,0.25)',
                                transition: 'background 150ms',
                            }}
                            onMouseEnter={e => { if (!exporting) e.currentTarget.style.background = '#155e1a'; }}
                            onMouseLeave={e => { if (!exporting) e.currentTarget.style.background = UEA_GREEN; }}
                        >
                            {exporting
                                ? <><CircularProgress size={14} sx={{ color: '#fff' }} /> Gerando...</>
                                : <><MdOutlineFileDownload size={16} /> Exportar PDF</>
                            }
                        </button>
                    )}
                </div>

                {/* ── Filters ── */}
                <div style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                    padding: '16px 20px', marginBottom: 24,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <MdOutlineFilterList size={16} color="#64748b" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Filtros</span>
                    </div>
                    <div style={{ width: 1, height: 24, background: '#e2e8f0', flexShrink: 0 }} />

                    <FormControl size="small" sx={{ minWidth: 280 }}>
                        <InputLabel>Avaliação</InputLabel>
                        <Select
                            value={selectedAvaliacaoId}
                            label="Avaliação"
                            disabled={loadingAval}
                            onChange={e => {
                                setSelectedAvaliacaoId(String(e.target.value));
                                setSelectedCurso('');
                            }}
                            sx={{ borderRadius: '8px' }}
                        >
                            {avaliacoes.length === 0 && (
                                <MenuItem disabled value="">Nenhuma avaliação encontrada</MenuItem>
                            )}
                            {avaliacoes.map(a => (
                                <MenuItem key={a.id} value={String(a.id)}>
                                    {a.periodo_letivo} — {a.ano}
                                    {a.modalidades?.length
                                        ? ` (${a.modalidades.map(m => m.mod_ensino).join(', ')})`
                                        : ''}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedAvaliacaoId && (
                        <FormControl size="small" sx={{ minWidth: 280 }}>
                            <InputLabel>Curso</InputLabel>
                            <Select
                                value={selectedCurso}
                                label="Curso"
                                disabled={loadingBase}
                                onChange={e => setSelectedCurso(e.target.value)}
                                sx={{ borderRadius: '8px' }}
                            >
                                <MenuItem value="">
                                    <em>Todos os cursos</em>
                                </MenuItem>
                                {availableCursos.map(c => (
                                    <MenuItem key={c} value={c}>
                                        {c}
                                        <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>
                                            ({baseReport?.participacao?.curso?.[c] ?? 0} resp.)
                                        </span>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {isLoadingReport && (
                        <CircularProgress size={18} sx={{ color: UEA_GREEN, ml: 1 }} />
                    )}
                </div>

                {/* ── Empty: no avaliação selected ── */}
                {!selectedAvaliacaoId && (
                    <EmptyState
                        icon={<MdOutlineAssessment size={48} />}
                        title="Selecione uma avaliação"
                        subtitle="Escolha uma avaliação no filtro acima para visualizar os resultados do relatório de autoavaliação."
                    />
                )}

                {/* ── Loading ── */}
                {selectedAvaliacaoId && isLoadingReport && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        minHeight: 300, background: '#fff', border: '1px solid #e2e8f0',
                        borderRadius: 14, gap: 12,
                    }}>
                        <CircularProgress size={24} sx={{ color: UEA_GREEN }} />
                        <span style={{ fontSize: 14, color: '#64748b' }}>Carregando relatório...</span>
                    </div>
                )}

                {/* ── Empty: no responses ── */}
                {selectedAvaliacaoId && !isLoadingReport && respondentes === 0 && (
                    <EmptyState
                        icon={
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                            </svg>
                        }
                        title="Sem respostas registradas"
                        subtitle={`Não há respostas para esta avaliação${selectedCurso ? ` no curso "${selectedCurso}"` : ''}. O relatório será gerado automaticamente quando os avaliadores responderem.`}
                    />
                )}

                {/* ── Report ── */}
                {selectedAvaliacaoId && !isLoadingReport && respondentes > 0 && (
                    <div ref={reportRef} style={{
                        background: '#f8fafc', borderRadius: 14, padding: 4,
                        ...(exportMode && { maxWidth: '860px', margin: '0 auto' }),
                    }}>

                        {/* ── Capa (só aparece no modo de exportação) ── */}
                        {exportMode && (
                            <CoverPage
                                curso={selectedCurso || 'Todos os cursos'}
                                unidade={selectedCurso ? (Object.keys(activeReport?.participacao?.unidade ?? {})[0] ?? '') : ''}
                                periodo={selectedAvaliacao?.periodo_letivo ?? ''}
                                ano={selectedAvaliacao?.ano ?? ''}
                            />
                        )}

                        {/* Stats */}
                        <div data-pdf-stats="" style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap', padding: '16px 4px 0' }}>
                            <StatCard
                                label="Período"
                                value={selectedAvaliacao?.periodo_letivo ?? '—'}
                                sublabel={`Ano ${selectedAvaliacao?.ano ?? '—'}`}
                                accent={UEA_GREEN}
                            />
                            <StatCard
                                label="Respondentes"
                                value={respondentes}
                                sublabel="avaliadores únicos"
                                accent="#3b82f6"
                            />
                            {selectedCurso ? (
                                <StatCard
                                    label="Curso filtrado"
                                    value={selectedCurso}
                                    accent="#f59e0b"
                                />
                            ) : (
                                availableCursos.length > 0 && (
                                    <StatCard
                                        label="Cursos com Respostas"
                                        value={availableCursos.length}
                                        sublabel="cursos distintos"
                                        accent="#8b5cf6"
                                    />
                                )
                            )}
                        </div>

                        {/* Eixos */}
                        <div style={{ padding: '0 4px 16px' }}>
                            {eixos.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>
                                    Nenhum eixo encontrado para esta avaliação.
                                </div>
                            ) : (
                                eixos.map(([eixoKey, eixo], i) => (
                                    exportMode
                                        ? <EixoFlat key={eixoKey} eixoKey={eixoKey} eixo={eixo} />
                                        : <EixoAccordion key={eixoKey} eixoKey={eixoKey} eixo={eixo} defaultExpanded={i === 0} />
                                ))
                            )}
                        </div>

                        {/* Tabelas no final */}
                        {eixos.length > 0 && <TabelasFinais eixos={eixos} />}

                    </div>
                )}

            </div>
        </>
    );
};

export default AutoavaliacaoInstitucional;
