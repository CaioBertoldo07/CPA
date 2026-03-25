import React, { useState } from 'react';
import TableCursos from '../components/Tables/TableCursos';
import ModalClassificarCursos from '../components/Modals/ModalClassificarCursos';
import { useNotification } from '../context/NotificationContext';
import { useUpdateCursosStatusMutation } from '../hooks/mutations/useCursoMutations';

const FILTROS = ['TODOS', 'ATIVOS', 'INATIVOS'];

const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', border: 'none', borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap', fontFamily: 'inherit',
    transition: 'all 150ms ease',
};

const Cursos = () => {
    const [filtroStatus, setFiltroStatus]   = useState('TODOS');
    const [searchQuery, setSearchQuery]     = useState('');
    const [selectedIds, setSelectedIds]     = useState([]);
    const [currentItems, setCurrentItems]   = useState([]);
    const [modalAberto, setModalAberto]     = useState(false);

    const showNotification  = useNotification();
    const updateStatusMutation = useUpdateCursosStatusMutation();

    // Cursos selecionados que ainda não têm classificação
    const selectedSemClassificacao = currentItems.filter(
        c => selectedIds.some(id => String(id) === String(c.id)) && !c.modalidade_rel
    );
    const canClassificar = selectedSemClassificacao.length > 0;

    const canAtivar   = filtroStatus === 'INATIVOS' && selectedIds.length > 0;
    const canInativar = filtroStatus === 'ATIVOS'   && selectedIds.length > 0;

    const handleAtivar = () => {
        updateStatusMutation.mutate(
            { cursoIds: selectedIds, ativo: true },
            {
                onSuccess: () => {
                    showNotification(`${selectedIds.length} curso(s) ativado(s) com sucesso!`, 'success');
                    setSelectedIds([]);
                },
                onError: () => showNotification('Erro ao ativar cursos.', 'error'),
            }
        );
    };

    const handleInativar = () => {
        updateStatusMutation.mutate(
            { cursoIds: selectedIds, ativo: false },
            {
                onSuccess: () => {
                    showNotification(`${selectedIds.length} curso(s) inativado(s) com sucesso!`, 'success');
                    setSelectedIds([]);
                },
                onError: () => showNotification('Erro ao inativar cursos.', 'error'),
            }
        );
    };

    const handleSuccess = (message) => {
        showNotification(message || 'Operação realizada com sucesso!', 'success');
        setSelectedIds([]);
    };

    return (
        <>
            <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <div style={{ width: '100%' }}>

                {/* ── Cabeçalho ── */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', flexWrap: 'wrap',
                    gap: 16, marginBottom: 28,
                    paddingBottom: 20, borderBottom: '1px solid #e2e8f0',
                }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px' }}>
                            Cursos
                        </h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                            Gerencie os cursos cadastrados, suas modalidades e situação
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {/* Classificar — habilitado apenas quando há cursos sem classificação selecionados */}
                        <button
                            onClick={() => canClassificar && setModalAberto(true)}
                            disabled={!canClassificar}
                            title={!canClassificar ? 'Selecione ao menos um curso sem classificação' : ''}
                            style={{
                                ...btnBase,
                                background: '#1d4ed8', color: '#fff',
                                boxShadow: canClassificar ? '0 2px 8px rgba(29,78,216,0.25)' : 'none',
                                opacity: canClassificar ? 1 : 0.45,
                                cursor: canClassificar ? 'pointer' : 'not-allowed',
                            }}
                            onMouseEnter={e => { if (canClassificar) { e.currentTarget.style.background = '#1e40af'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            Classificar Curso
                        </button>

                        {/* Ativar — habilitado apenas no filtro INATIVOS com seleção */}
                        <button
                            onClick={handleAtivar}
                            disabled={!canAtivar || updateStatusMutation.isPending}
                            title={filtroStatus !== 'INATIVOS' ? 'Selecione o filtro "Inativos" para ativar' : ''}
                            style={{
                                ...btnBase,
                                background: '#1D5E24', color: '#fff',
                                boxShadow: canAtivar ? '0 2px 8px rgba(29,94,36,0.25)' : 'none',
                                opacity: canAtivar ? 1 : 0.45,
                                cursor: canAtivar ? 'pointer' : 'not-allowed',
                            }}
                            onMouseEnter={e => { if (canAtivar) { e.currentTarget.style.background = '#256428'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#1D5E24'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Ativar Curso
                        </button>

                        {/* Inativar — habilitado apenas no filtro ATIVOS com seleção */}
                        <button
                            onClick={handleInativar}
                            disabled={!canInativar || updateStatusMutation.isPending}
                            title={filtroStatus !== 'ATIVOS' ? 'Selecione o filtro "Ativos" para inativar' : ''}
                            style={{
                                ...btnBase,
                                background: '#374151', color: '#fff',
                                boxShadow: canInativar ? '0 2px 8px rgba(55,65,81,0.2)' : 'none',
                                opacity: canInativar ? 1 : 0.45,
                                cursor: canInativar ? 'pointer' : 'not-allowed',
                            }}
                            onMouseEnter={e => { if (canInativar) { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                            Inativar Curso
                        </button>
                    </div>
                </div>

                {/* ── Toolbar: Filtros + Busca ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    {/* Tabs de status */}
                    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
                        {FILTROS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFiltroStatus(f)}
                                style={{
                                    padding: '6px 14px',
                                    border: 'none',
                                    borderRadius: 7,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    letterSpacing: '0.3px',
                                    transition: 'all 150ms ease',
                                    background: filtroStatus === f ? '#fff' : 'transparent',
                                    color: filtroStatus === f
                                        ? (f === 'ATIVOS' ? '#1D5E24' : f === 'INATIVOS' ? '#374151' : '#1a202c')
                                        : '#64748b',
                                    boxShadow: filtroStatus === f ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Barra de busca */}
                    <div
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: '#fff', border: '1.5px solid #e2e8f0',
                            borderRadius: 10, padding: '10px 16px',
                            flex: 1, maxWidth: 420,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            transition: 'border-color 150ms, box-shadow 150ms',
                        }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = '#1D5E24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,94,36,0.1)'; }}
                        onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar cursos..."
                            style={{
                                border: 'none', outline: 'none', background: 'transparent',
                                fontSize: 13, color: '#1a202c', width: '100%', fontFamily: 'inherit',
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
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
                    overflow: 'hidden',
                    animation: 'fadeInUp 400ms 150ms both',
                }}>
                    <TableCursos
                        searchQuery={searchQuery}
                        filtroStatus={filtroStatus}
                        onSelectionChange={setSelectedIds}
                        onItemsLoaded={setCurrentItems}
                    />
                </div>
            </div>

            <ModalClassificarCursos
                show={modalAberto}
                onHide={() => setModalAberto(false)}
                cursoIds={selectedSemClassificacao.map(c => c.id)}
                onSuccess={handleSuccess}
            />
        </>
    );
};

export default Cursos;
