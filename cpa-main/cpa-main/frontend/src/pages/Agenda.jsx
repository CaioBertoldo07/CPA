import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useGetAvaliacoesQuery } from '../hooks/queries/useAvaliacaoQueries';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const STATUS_MAP = {
    1: { label: 'Rascunho', bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
    2: { label: 'Enviada', bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
    3: { label: 'Encerrada', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
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
    const { data: avaliacoes = [], isLoading, isError } = useGetAvaliacoesQuery();
    const [currentView, setCurrentView] = useState(Views.MONTH);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);

    const events = useMemo(() => {
        return avaliacoes
            .filter(a => filterStatus ? a.status === filterStatus : true)
            .filter(a => a.data_inicio && a.data_fim)
            .map(a => {
                const modalidades = (a.modalidades || []).map(m => m.mod_ensino).join(', ') || 'Sem modalidade';
                return {
                    id: a.id,
                    title: modalidades,
                    start: new Date(a.data_inicio + 'T00:00:00'),
                    end: new Date(a.data_fim + 'T23:59:59'),
                    status: a.status,
                    ano: a.ano,
                    periodo_letivo: a.periodo_letivo,
                    data_inicio: a.data_inicio,
                    data_fim: a.data_fim,
                    modalidades: modalidades,
                };
            });
    }, [avaliacoes, filterStatus]);

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

    const fmt = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

    const counts = useMemo(() => ({
        total: avaliacoes.length,
        rascunho: avaliacoes.filter(a => a.status === 1).length,
        enviada: avaliacoes.filter(a => a.status === 2).length,
        encerrada: avaliacoes.filter(a => a.status === 3).length,
    }), [avaliacoes]);

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
                        { label: 'Encerradas', value: counts.encerrada, bg: '#dcfce7', color: '#15803d', dot: '#22c55e', status: 3 },
                    ].map(card => (
                        <button
                            key={card.label}
                            onClick={() => setFilterStatus(filterStatus === card.status ? null : (card.status ?? null))}
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

                {/* Legenda */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Legenda:</span>
                    {Object.entries(STATUS_MAP).map(([key, s]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: s.bg, border: `1.5px solid ${s.border}`, display: 'inline-block' }} />
                            <span style={{ fontSize: 12, color: '#64748b' }}>{s.label}</span>
                        </div>
                    ))}
                    {filterStatus !== null && (
                        <button
                            onClick={() => setFilterStatus(null)}
                            style={{ marginLeft: 'auto', fontSize: 12, color: '#1D5E24', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            Limpar filtro ×
                        </button>
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
