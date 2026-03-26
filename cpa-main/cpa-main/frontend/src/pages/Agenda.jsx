import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Autocomplete, TextField } from '@mui/material';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useGetAvaliacoesQuery } from '../hooks/queries/useAvaliacaoQueries';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const STATUS_MAP = {
    1: { label: 'Rascunho', bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
    2: { label: 'Enviada', bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
    3: { label: 'Encerrada', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
};

const MESSAGES = {
    allDay: 'Dia todo',
    previous: '‹',
    next: '›',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Avaliação',
    noEventsInRange: 'Nenhuma avaliação neste período.',
    showMore: total => `+ ${total} avaliações`,
};

const EventComponent = ({ event }) => {
    const s = STATUS_MAP[event.status] || STATUS_MAP[1];
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '1px 4px', overflow: 'hidden',
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: s.border, flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {event.title}
            </span>
        </div>
    );
};

const Agenda = () => {
    const { data: _avaliacoesResp, isLoading, isError } = useGetAvaliacoesQuery();
    const avaliacoes = _avaliacoesResp?.data ?? [];
    const [currentView, setCurrentView] = useState(Views.MONTH);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterAno, setFilterAno] = useState(null);
    const [filterSemestre, setFilterSemestre] = useState(null);
    const hasInitializedDefaultAno = useRef(false);

    const hasActiveFilters = filterStatus !== null || filterDateFrom || filterDateTo || filterAno;

    const clearAllFilters = () => {
        setFilterStatus(null);
        setFilterDateFrom('');
        setFilterDateTo('');
        setFilterAno(null);
        setFilterSemestre(null);
    };

    // Converte data_inicio/data_fim que podem vir como:
    //   "YYYY-MM-DD"                 → sem "T", adiciona "T00:00:00" (horário local)
    //   "YYYY-MM-DDTHH:mm:ss.sssZ"  → já tem "T", usa new Date() diretamente
    //   Date                        → retorna como está
    // Se o resultado for inválido retorna null.
    const parseDate = (value, endOfDay = false) => {
        if (!value) return null;
        if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
        // Extrai apenas YYYY-MM-DD para evitar shift de fuso horário UTC→local
        const datePart = String(value).substring(0, 10);
        const d = new Date(datePart + (endOfDay ? 'T23:59:59' : 'T00:00:00'));
        return isNaN(d.getTime()) ? null : d;
    };

    const events = useMemo(() => {
        // Debug: inspeciona o primeiro item para verificar tipos em runtime
        if (avaliacoes.length > 0) {
            const a0 = avaliacoes[0];
            console.debug(
                '[Agenda] amostra data_inicio →', typeof a0.data_inicio, a0.data_inicio,
                '| parse →', parseDate(a0.data_inicio),
                '| typeof status →', typeof a0.status, a0.status,
            );
        }

        const from = filterDateFrom ? new Date(filterDateFrom + 'T00:00:00') : null;
        const to   = filterDateTo   ? new Date(filterDateTo   + 'T23:59:59') : null;

        return avaliacoes
            .filter(a => {
                const status = Number(a.status);
                return filterStatus ? status === filterStatus : true;
            })
            .filter(a => {
                if (!filterAno) return true;
                const [ano, sem] = (a.periodo_letivo || '').split('.');
                if (ano !== filterAno) return false;
                if (filterSemestre && sem !== filterSemestre) return false;
                return true;
            })
            .filter(a => {
                const start = parseDate(a.data_inicio);
                const end   = parseDate(a.data_fim, true);
                return start !== null && end !== null;
            })
            .filter(a => {
                if (!from && !to) return true;
                const start = parseDate(a.data_inicio);
                const end   = parseDate(a.data_fim, true);
                // sobreposição: o evento começa antes do fim do range E termina depois do início
                if (from && end < from) return false;
                if (to   && start > to) return false;
                return true;
            })
            .map(a => {
                const status = Number(a.status);
                const modalidades = (a.modalidades || []).map(m => m.mod_ensino).join(', ') || 'Sem modalidade';
                return {
                    id: a.id,
                    title: modalidades,
                    start: parseDate(a.data_inicio),
                    end: parseDate(a.data_fim, true),
                    status,
                    ano: a.ano,
                    periodo_letivo: a.periodo_letivo,
                    data_inicio: a.data_inicio,
                    data_fim: a.data_fim,
                    modalidades,
                };
            });
    }, [avaliacoes, filterStatus, filterAno, filterSemestre, filterDateFrom, filterDateTo]);

    const eventStyleGetter = (event) => {
        const s = STATUS_MAP[event.status] || STATUS_MAP[1];
        return {
            style: {
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                padding: '1px 0',
            },
        };
    };

    // Para exibição no modal: extrai a parte YYYY-MM-DD antes de qualquer "T"
    // para evitar interpretação UTC que desloca o dia.
    const fmt = d => {
        if (!d) return '—';
        const datePart = String(d).split('T')[0];
        const date = new Date(datePart + 'T00:00:00');
        return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
    };

    const counts = useMemo(() => ({
        total: avaliacoes.length,
        rascunho:  avaliacoes.filter(a => Number(a.status) === 1).length,
        enviada:   avaliacoes.filter(a => Number(a.status) === 2).length,
        encerrada: avaliacoes.filter(a => Number(a.status) === 3).length,
    }), [avaliacoes]);

    // Períodos letivos únicos → mapa { ano: [semestres] } → lista de anos
    const { semestresPorAno, anos } = useMemo(() => {
        const map = {};
        avaliacoes.forEach(a => {
            const p = a.periodo_letivo;
            if (!p) return;
            const [ano, sem] = p.split('.');
            if (!ano) return;
            if (!map[ano]) map[ano] = [];
            if (sem && !map[ano].includes(sem)) map[ano].push(sem);
        });
        // ordena os semestres dentro de cada ano
        Object.values(map).forEach(sems => sems.sort());
        const anosOrdenados = Object.keys(map).sort((a, b) => b.localeCompare(a));
        return { semestresPorAno: map, anos: anosOrdenados };
    }, [avaliacoes]);

    useEffect(() => {
        if (!hasInitializedDefaultAno.current && anos.length > 0) {
            setFilterAno(anos[0]);
            hasInitializedDefaultAno.current = true;
        }
    }, [anos]);

    return (
        <>
            <style>{`
                @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

                .rbc-calendar { font-family: inherit !important; }
                .rbc-header { background: #f8fafc; border-bottom: 1px solid #e2e8f0 !important; padding: 10px 0 !important; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: none !important; }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9 !important; }
                .rbc-month-row + .rbc-month-row { border-top: 1px solid #f1f5f9 !important; }
                .rbc-off-range-bg { background: #fafafa !important; }
                .rbc-today { background: #f0fdf4 !important; }
                .rbc-toolbar { padding: 0 0 18px 0 !important; gap: 10px; flex-wrap: wrap; }
                .rbc-btn-group { display: flex !important; gap: 6px !important; }
                .rbc-btn-group button { margin: 0 !important; }
                .rbc-toolbar button { font-size: 12px !important; font-weight: 600 !important; border-radius: 8px !important; border: 1.5px solid #e2e8f0 !important; color: #64748b !important; padding: 6px 14px !important; background: #fff !important; cursor: pointer; transition: all 150ms; }
                .rbc-toolbar button:hover { border-color: #1D5E24 !important; color: #1D5E24 !important; }
                .rbc-toolbar button.rbc-active { background: #1D5E24 !important; color: #fff !important; border-color: #1D5E24 !important; }
                .rbc-toolbar .rbc-toolbar-label { font-size: 15px !important; font-weight: 700 !important; color: #1a202c !important; }
                .rbc-event { border-radius: 6px !important; }
                .rbc-event:focus { outline: none !important; }
                .rbc-show-more { color: #1D5E24 !important; font-size: 11px !important; font-weight: 600 !important; }
                .rbc-agenda-table { border: none !important; }
                .rbc-agenda-date-cell, .rbc-agenda-time-cell { color: #64748b; font-size: 12px; padding: 10px 14px !important; }
                .rbc-agenda-event-cell { padding: 10px 14px !important; }
                .rbc-agenda-table tbody > tr > td { border-top: 1px solid #f1f5f9 !important; }
                .rbc-agenda-table thead { background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
                .rbc-agenda-table thead > tr > th { padding: 8px 14px !important; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

                /* ── Agenda filter buttons hover ── */
                .agenda-filter-button {
                    transition: all 150ms !important;
                }
                .agenda-filter-button:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.12) !important;
                }
                .agenda-filter-button:active {
                    transform: translateY(0) !important;
                }
                .agenda-filter-clear:hover {
                    color: #256428 !important;
                    text-decoration: underline;
                }
            `}</style>

            <div style={{ width: '100%', maxWidth: '1600px', animation: 'fadeInUp 400ms both' }}>

                {/* Cabeçalho */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px' }}>Agenda</h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Visualize os períodos das avaliações no calendário</p>
                    </div>
                </div>

                {/* Cards de resumo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                    {[
                        { label: 'Total', value: counts.total, bg: '#f8fafc', color: '#1a202c', dot: '#64748b' },
                        { label: 'Rascunho', value: counts.rascunho, bg: '#f8fafc', color: '#64748b', dot: '#94a3b8', status: 1 },
                        { label: 'Enviadas', value: counts.enviada, bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6', status: 2 },
                        { label: 'Encerradas', value: counts.encerrada, bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', status: 3 },
                    ].map(card => (
                        <button
                            key={card.label}
                            onClick={() => setFilterStatus(filterStatus === card.status ? null : (card.status ?? null))}
                            className="agenda-filter-button"
                            style={{
                                background: filterStatus === (card.status ?? null) && card.status !== undefined ? card.bg : '#fff',
                                border: `1.5px solid ${filterStatus === card.status && card.status !== undefined ? card.dot : '#e2e8f0'}`,
                                borderRadius: 12, padding: '14px 18px', textAlign: 'left', cursor: 'pointer',
                                transition: 'all 150ms', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: card.dot }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{card.label}</span>
                            </div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: card.color, lineHeight: 1 }}>{card.value}</div>
                        </button>
                    ))}
                </div>

                {/* ── Filtros de data e período ── */}
                <div style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                    padding: '14px 18px', marginBottom: 18,
                    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                    {/* ── Ícone + label ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Filtros</span>
                    </div>

                    <div style={{ width: 1, height: 24, background: '#e2e8f0', flexShrink: 0 }} />

                    {/* ── Data de ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap', marginBottom: 0, textTransform: 'uppercase' }}>Período a ser Avaliado:</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>De</span>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#f8fafc', border: `1.5px solid ${filterDateFrom ? '#1D5E24' : '#e2e8f0'}`,
                            borderRadius: 8, padding: '5px 10px', transition: 'border-color 150ms',
                        }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={filterDateFrom ? '#1D5E24' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <input
                                type="date"
                                value={filterDateFrom}
                                max={filterDateTo || undefined}
                                onChange={e => setFilterDateFrom(e.target.value)}
                                style={{
                                    border: 'none', outline: 'none', background: 'transparent',
                                    fontSize: 12, color: '#1a202c', fontFamily: 'inherit', cursor: 'pointer',
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Data até ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Até</span>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#f8fafc', border: `1.5px solid ${filterDateTo ? '#1D5E24' : '#e2e8f0'}`,
                            borderRadius: 8, padding: '5px 10px', transition: 'border-color 150ms',
                        }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={filterDateTo ? '#1D5E24' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
                            </svg>
                            <input
                                type="date"
                                value={filterDateTo}
                                min={filterDateFrom || undefined}
                                onChange={e => setFilterDateTo(e.target.value)}
                                style={{
                                    border: 'none', outline: 'none', background: 'transparent',
                                    fontSize: 12, color: '#1a202c', fontFamily: 'inherit', cursor: 'pointer',
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Período letivo (hierárquico) ── */}
                    {anos.length > 0 && (
                        <>
                            <div style={{ width: 1, height: 24, background: '#e2e8f0', flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                                {/* Linha de anos */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                        Ano
                                    </span>
                                    <Autocomplete
                                        size="small"
                                        options={anos}
                                        value={filterAno}
                                        onChange={(_, newValue) => {
                                            setFilterAno(newValue || null);
                                            setFilterSemestre(null);
                                        }}
                                        clearOnEscape
                                        autoHighlight
                                        noOptionsText="Nenhum ano encontrado"
                                        sx={{
                                            minWidth: 170,
                                            '& .MuiOutlinedInput-root': {
                                                background: '#f8fafc',
                                                borderRadius: '10px',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: '#1a202c',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '1.5px',
                                                    borderColor: filterAno ? '#1D5E24' : '#e2e8f0',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: filterAno ? '#1D5E24' : '#cbd5e1',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#1D5E24',
                                                    borderWidth: '1.5px',
                                                },
                                            },
                                        }}
                                        slotProps={{
                                            paper: {
                                                sx: {
                                                    mt: 0.6,
                                                    borderRadius: 2,
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: '0 12px 28px rgba(15,23,42,0.14)',
                                                    '& .MuiAutocomplete-option': {
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                    },
                                                },
                                            },
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Buscar ano"
                                                inputProps={{
                                                    ...params.inputProps,
                                                    'aria-label': 'Filtro de ano',
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Linha de semestres — só aparece quando um ano está selecionado */}
                                {filterAno && (semestresPorAno[filterAno] || []).length > 0 && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        paddingLeft: 2,
                                        animation: 'fadeInUp 180ms both',
                                    }}>
                                        {/* conector visual */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, color: '#cbd5e1', flexShrink: 0 }}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <path d="M4 2 v7 q0 4 4 4 h6" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                            Semestre
                                        </span>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            {(semestresPorAno[filterAno] || []).map(sem => {
                                                const ativo = filterSemestre === sem;
                                                const label = sem === '1' ? '1º Semestre' : sem === '2' ? '2º Semestre' : `${sem}º Semestre`;
                                                return (
                                                    <button
                                                        key={sem}
                                                        onClick={() => setFilterSemestre(ativo ? null : sem)}
                                                        style={{
                                                            padding: '4px 13px', fontSize: 11, fontWeight: 600,
                                                            borderRadius: 9999, cursor: 'pointer', transition: 'all 150ms',
                                                            border: `1.5px solid ${ativo ? '#2563eb' : '#e2e8f0'}`,
                                                            background: ativo ? '#dbeafe' : '#f8fafc',
                                                            color: ativo ? '#1d4ed8' : '#64748b',
                                                        }}
                                                        onMouseEnter={e => { if (!ativo) { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb'; } }}
                                                        onMouseLeave={e => { if (!ativo) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; } }}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </>
                    )}

                    {/* ── Limpar tudo ── */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            style={{
                                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                                padding: '5px 12px', fontSize: 12, fontWeight: 600,
                                color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5',
                                borderRadius: 8, cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Limpar filtros
                        </button>
                    )}
                </div>

                {/* Legenda */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Legenda:</span>
                    {Object.entries(STATUS_MAP).map(([key, s]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: s.bg, border: `1.5px solid ${s.border}`, display: 'inline-block' }} />
                            <span style={{ fontSize: 12, color: '#64748b' }}>{s.label}</span>
                        </div>
                    ))}
                    {hasActiveFilters && (
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#1D5E24', fontWeight: 600 }}>
                            {events.length} avaliação{events.length !== 1 ? 'ões' : ''} encontrada{events.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Calendário */}
                <div style={{
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    padding: '24px', overflow: 'hidden',
                }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 500, color: '#64748b', fontSize: 14 }}>
                            Carregando avaliações...
                        </div>
                    ) : isError ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 500, color: '#e53e3e', fontSize: 14 }}>
                            Erro ao carregar avaliações.
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 620 }}
                            view={currentView}
                            onView={setCurrentView}
                            date={currentDate}
                            onNavigate={setCurrentDate}
                            messages={MESSAGES}
                            formats={{
                                dateFormat: 'DD/MM',
                                dayFormat: 'DD/MM ddd',
                                weekdayFormat: 'ddd',
                                monthHeaderFormat: 'MMMM [de] YYYY',
                                dayHeaderFormat: 'dddd, DD/MM/YYYY',
                                dayRangeHeaderFormat: ({ start, end }) =>
                                    `${moment(start).format('DD/MM/YYYY')} – ${moment(end).format('DD/MM/YYYY')}`,
                                agendaDateFormat: 'DD/MM/YYYY',
                                agendaTimeFormat: 'HH:mm',
                                agendaTimeRangeFormat: ({ start, end }) =>
                                    `${moment(start).format('DD/MM/YYYY')} – ${moment(end).format('DD/MM/YYYY')}`,
                                agendaHeaderFormat: ({ start, end }) =>
                                    `${moment(start).format('DD/MM/YYYY')} – ${moment(end).format('DD/MM/YYYY')}`,
                            }}
                            eventPropGetter={eventStyleGetter}
                            components={{ event: EventComponent }}
                            onSelectEvent={setSelectedEvent}
                            popup
                        />
                    )}
                </div>

                {/* Modal de detalhes do evento */}
                {selectedEvent && (
                    <div
                        onClick={() => setSelectedEvent(null)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
                            backdropFilter: 'blur(3px)', zIndex: 2000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: '#fff', borderRadius: 16, padding: '28px 32px',
                                minWidth: 340, maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                                animation: 'fadeInUp 200ms both',
                            }}
                        >
                            {/* Header do modal */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        background: STATUS_MAP[selectedEvent.status]?.bg || '#f1f5f9',
                                        color: STATUS_MAP[selectedEvent.status]?.color || '#64748b',
                                        border: `1px solid ${STATUS_MAP[selectedEvent.status]?.border || '#e2e8f0'}`,
                                        borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8,
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_MAP[selectedEvent.status]?.border }} />
                                        {STATUS_MAP[selectedEvent.status]?.label || 'Rascunho'}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a202c' }}>
                                        {selectedEvent.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, marginLeft: 12 }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Informações */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { label: 'Código', value: `#${selectedEvent.id}` },
                                    { label: 'Modalidades', value: selectedEvent.modalidades },
                                    { label: 'Período Letivo', value: selectedEvent.periodo_letivo || '—' },
                                    { label: 'Ano', value: selectedEvent.ano || '—' },
                                    { label: 'Início', value: fmt(selectedEvent.data_inicio) },
                                    { label: 'Fim', value: fmt(selectedEvent.data_fim) },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
                                            {row.label}
                                        </span>
                                        <span style={{ fontSize: 13, color: '#1a202c', fontWeight: 500, textAlign: 'right' }}>
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedEvent(null)}
                                style={{
                                    marginTop: 22, width: '100%', padding: '10px', background: '#1D5E24',
                                    color: '#fff', border: 'none', borderRadius: 10, fontSize: 13,
                                    fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Agenda;
