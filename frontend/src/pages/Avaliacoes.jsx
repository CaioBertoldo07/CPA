import React, { useState, useMemo } from 'react';
import TableAvaliacao from '../components/Tables/Table_Avaliacao';
import ModalAvaliacoes from '../components/Modals/Modal_Avaliacoes';
import DrawerAvaliacaoDetalhes from '../components/DrawerAvaliacaoDetalhes';
import AnimatedMultiSelect from '../components/utils/AnimatedMultiSelect';
import { useNotification } from '../context/NotificationContext';
import { useGetModalidadesQuery } from '../hooks/queries/useModalidadeQueries';
import { useGetUnidadesQuery } from '../hooks/queries/useUnidadeQueries';
import { useGetCategoriasQuery } from '../hooks/queries/useCategoriaQueries';

// Filtros de status
const FILTROS = [
    { label: 'Todos', status: null },
    { label: 'Rascunho', status: 1 },
    { label: 'Enviadas', status: 2 },
    { label: 'Ativas', status: 3 },
    { label: 'Encerradas', status: 4 },
];

const Avaliacoes = () => {
    const [modalShow, setModalShow] = useState(false);
    const [editAvaliacaoId, setEditAvaliacaoId] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerAvaliacaoId, setDrawerAvaliacaoId] = useState(null);
    const [selectedModalidades, setSelectedModalidades] = useState([]);
    const [selectedUnidades, setSelectedUnidades] = useState([]);
    const [selectedCategorias, setSelectedCategorias] = useState([]);
    const [periodoFilter, setPeriodoFilter] = useState('');
    const [dataInicioFilter, setDataInicioFilter] = useState('');
    const [dataFimFilter, setDataFimFilter] = useState('');
    const showNotification = useNotification();

    const { data: modalidadesData = [] } = useGetModalidadesQuery();
    const modalidadesOptions = useMemo(
        () => modalidadesData.filter(Boolean).map(m => ({ value: m.id, label: m.mod_ensino || m.nome })),
        [modalidadesData]
    );

    const { data: unidadesData = [] } = useGetUnidadesQuery();
    const unidadesOptions = useMemo(() => {
        const unique = new Map();
        unidadesData.forEach(u => { if (u?.nome && !unique.has(u.nome)) unique.set(u.nome, { value: u.id, label: u.nome }); });
        return Array.from(unique.values());
    }, [unidadesData]);

    const { data: categoriasData = [] } = useGetCategoriasQuery();
    const categoriasOptions = useMemo(
        () => categoriasData.filter(Boolean).map(c => ({ value: c.id, label: c.nome })),
        [categoriasData]
    );

    const extraFilters = useMemo(() => {
        const filters = [];
        if (periodoFilter) {
            filters.push({ id: 'periodo', field: 'periodo_letivo', operator: 'contains', value: periodoFilter });
        }
        if (dataInicioFilter) {
            filters.push({ id: 'data_inicio', field: 'data_inicio', operator: 'onOrAfter', value: new Date(dataInicioFilter + 'T00:00:00') });
        }
        if (dataFimFilter) {
            filters.push({ id: 'data_fim', field: 'data_fim', operator: 'onOrBefore', value: new Date(dataFimFilter + 'T23:59:59') });
        }
        if (selectedModalidades.length > 0) {
            filters.push({ id: 'modalidades', field: 'modalidades', operator: 'isAnyOf', value: selectedModalidades.map(m => m.label) });
        }
        if (selectedUnidades.length > 0) {
            filters.push({ id: 'unidade', field: 'unidade', operator: 'isAnyOf', value: selectedUnidades.map(u => u.label) });
        }
        if (selectedCategorias.length > 0) {
            filters.push({ id: 'categorias', field: 'categorias', operator: 'isAnyOf', value: selectedCategorias.map(c => c.value) });
        }
        return filters;
    }, [periodoFilter, dataInicioFilter, dataFimFilter, selectedModalidades, selectedUnidades, selectedCategorias]);

    const handleVerDetalhes = (id) => {
        setDrawerAvaliacaoId(id);
        setDrawerOpen(true);
    };

    const handleEditar = (id) => {
        setEditAvaliacaoId(id);
        setModalShow(true);
    };

    const handleNovaAvaliacao = () => {
        setEditAvaliacaoId(null);
        setModalShow(true);
    };

    const handleSuccess = (message) => {
        setModalShow(false);
        setEditAvaliacaoId(null);
        showNotification(message || 'Avaliação criada com sucesso!', 'success');
    };

    const handleModalHide = () => {
        setModalShow(false);
        setEditAvaliacaoId(null);
    };

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
                        onClick={handleNovaAvaliacao}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#1D5E24', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,94,36,0.25)', transition: 'all 150ms', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#256428'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1D5E24'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                        Nova Avaliação
                    </button>
                </div>

                {/* ── Filtros Avançados ── */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Período Letivo</label>
                            <input
                                type="text"
                                placeholder="Ex: 2024.1"
                                value={periodoFilter}
                                onChange={e => setPeriodoFilter(e.target.value)}
                                style={{ borderRadius: 8, border: '1px solid #e2e8f0', padding: '8px 12px', fontSize: 13, width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Data Início</label>
                            <input
                                type="date"
                                value={dataInicioFilter}
                                onChange={e => setDataInicioFilter(e.target.value)}
                                style={{ borderRadius: 8, border: '1px solid #e2e8f0', padding: '8px 12px', fontSize: 13, width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Data Fim</label>
                            <input
                                type="date"
                                value={dataFimFilter}
                                onChange={e => setDataFimFilter(e.target.value)}
                                style={{ borderRadius: 8, border: '1px solid #e2e8f0', padding: '8px 12px', fontSize: 13, width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Modalidade</label>
                            <AnimatedMultiSelect
                                placeholder="Selecione..."
                                options={modalidadesOptions}
                                value={selectedModalidades}
                                onChange={setSelectedModalidades}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Unidade</label>
                            <AnimatedMultiSelect
                                placeholder="Selecione..."
                                options={unidadesOptions}
                                value={selectedUnidades}
                                onChange={setSelectedUnidades}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Categoria</label>
                            <AnimatedMultiSelect
                                placeholder="Selecione..."
                                options={categoriasOptions}
                                value={selectedCategorias}
                                onChange={setSelectedCategorias}
                            />
                        </div>
                    </div>
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
                        extraFilters={extraFilters}
                        onVerDetalhes={handleVerDetalhes}
                        onEditar={handleEditar}
                    />
                </div>
            </div>

            <ModalAvaliacoes
                show={modalShow}
                onHide={handleModalHide}
                onSuccess={handleSuccess}
                avaliacaoId={editAvaliacaoId}
            />

            <DrawerAvaliacaoDetalhes
                avaliacaoId={drawerAvaliacaoId}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
};

export default Avaliacoes;