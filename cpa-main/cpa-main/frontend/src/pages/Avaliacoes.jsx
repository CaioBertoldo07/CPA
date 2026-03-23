import React, { useState, useMemo } from 'react';
import TableAvaliacao from '../components/Tables/Table_Avaliacao';
import ModalAvaliacoes from '../components/Modals/Modal_Avaliacoes';
import { useNotification } from '../context/NotificationContext';
import { useGetAvaliacoesQuery } from '../hooks/queries/useAvaliacaoQueries';

// Filtros de status
const FILTROS = [
    { label: 'Todos', status: null },
    { label: 'Rascunho', status: 1 },
    { label: 'Enviadas', status: 2 },
    { label: 'Encerradas', status: 3 },
];

const Avaliacoes = () => {
    const [modalShow, setModalShow] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filtroMunicipio, setFiltroMunicipio] = useState('');
    const [filtroUnidade, setFiltroUnidade] = useState('');
    const showNotification = useNotification();
    const { data: avaliacoes = [] } = useGetAvaliacoesQuery();

    // Derive available municipalities and units from loaded evaluations
    const municipiosDisponiveis = useMemo(() => {
        const map = new Map();
        avaliacoes.forEach(a => {
            (a.cursos || []).forEach(c => {
                if (c.municipio) map.set(c.municipio.id, c.municipio.nome);
            });
        });
        return Array.from(map.entries()).map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));
    }, [avaliacoes]);

    const unidadesDisponiveis = useMemo(() => {
        const map = new Map();
        avaliacoes.forEach(a => {
            (a.unidade || []).forEach(u => {
                if (u && u.id) map.set(u.id, u);
            });
        });
        return Array.from(map.values()).sort((a, b) => a.sigla.localeCompare(b.sigla));
    }, [avaliacoes]);

    const handleSuccess = (message) => {
        setModalShow(false);
        showNotification(message || 'Avaliação criada com sucesso!', 'success');
    };

    const hasActiveFilters = filtroMunicipio || filtroUnidade;
    const clearFilters = () => { setFiltroMunicipio(''); setFiltroUnidade(''); };

    return (
        <>
            <style>{`
                @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes skeletonPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
            `}</style>

            <div style={{ width: '100%' }}>

                {/* ── Cabeçalho ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px' }}>Avaliações</h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Crie e gerencie avaliações institucionais</p>
                    </div>
                    <button
                        onClick={() => setModalShow(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#1D5E24', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,94,36,0.25)', transition: 'all 150ms', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#256428'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1D5E24'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                        Nova Avaliação
                    </button>
                </div>

                {/* ── Filtros + Busca ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    {/* Filtros de status */}
                    <div style={{ display: 'flex', gap: 6, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        {FILTROS.map(f => (
                            <button
                                key={f.label}
                                onClick={() => setFiltroStatus(f.status)}
                                style={{
                                    padding: '5px 14px', fontSize: 12, fontWeight: 600, borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 150ms',
                                    background: filtroStatus === f.status ? '#1D5E24' : 'transparent',
                                    color: filtroStatus === f.status ? '#fff' : '#64748b',
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Search bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 14px', minWidth: 260, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'border-color 150ms, box-shadow 150ms' }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = '#1D5E24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,94,36,0.1)'; }}
                        onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar avaliações..."
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1a202c', width: '100%', fontFamily: 'inherit' }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        )}
                    </div>

                    {/* Filtro Município */}
                    {municipiosDisponiveis.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '6px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
                            </svg>
                            <select
                                value={filtroMunicipio}
                                onChange={e => setFiltroMunicipio(e.target.value)}
                                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: filtroMunicipio ? '#1a202c' : '#9ca3af', fontFamily: 'inherit', cursor: 'pointer', fontWeight: filtroMunicipio ? 600 : 400 }}
                            >
                                <option value="">Município</option>
                                {municipiosDisponiveis.map(m => (
                                    <option key={m.id} value={m.nome}>{m.nome}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Filtro Unidade */}
                    {unidadesDisponiveis.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '6px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" />
                            </svg>
                            <select
                                value={filtroUnidade}
                                onChange={e => setFiltroUnidade(e.target.value)}
                                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: filtroUnidade ? '#1a202c' : '#9ca3af', fontFamily: 'inherit', cursor: 'pointer', fontWeight: filtroUnidade ? 600 : 400 }}
                            >
                                <option value="">Unidade</option>
                                {unidadesDisponiveis.map(u => (
                                    <option key={u.id} value={u.id}>{u.sigla} – {u.nome}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Limpar filtros */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: 'transparent', border: '1.5px solid #fca5a5', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#ef4444', cursor: 'pointer', transition: 'all 150ms' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            Limpar filtros
                        </button>
                    )}
                </div>

                {/* ── Tabela ── */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    overflowX: 'auto',
                    animation: 'fadeInUp 400ms 150ms both'
                }}>
                    <TableAvaliacao
                        filtroStatus={filtroStatus}
                        searchQuery={searchQuery}
                        filtroMunicipio={filtroMunicipio}
                        filtroUnidade={filtroUnidade}
                    />
                </div>
            </div>

            <ModalAvaliacoes
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
};

export default Avaliacoes;