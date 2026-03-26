import React, { useState, useMemo } from 'react';
import TableCursos from '../components/Tables/TableCursos';
import ModalClassificarCursos from '../components/Modals/ModalClassificarCursos';
import AnimatedMultiSelect from '../components/utils/AnimatedMultiSelect';
import { useNotification } from '../context/NotificationContext';
import { useUpdateCursosStatusMutation } from '../hooks/mutations/useCursoMutations';
import { useGetUnidadesQuery } from '../hooks/queries/useUnidadeQueries';
import { useGetMunicipiosQuery } from '../hooks/queries/useMunicipioQueries';
import { useGetCursoTypesQuery } from '../hooks/queries/useCursoQueries';
import { useGetModalidadesQuery } from '../hooks/queries/useModalidadeQueries';

const FILTROS = ['TODOS', 'ATIVOS', 'INATIVOS'];
const FILTRO_STATUS_INICIAL = 'ATIVOS';
const SEM_MODALIDADE_OPTION = { value: 'SEM_MODALIDADE', label: 'Sem modalidade' };

const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', border: 'none', borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap', fontFamily: 'inherit',
    transition: 'all 150ms ease',
};

const filterLabelStyle = {
    fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block'
};

const Cursos = () => {
    const [filtroStatus, setFiltroStatus] = useState(FILTRO_STATUS_INICIAL);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentItems, setCurrentItems] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [selectedUnidades, setSelectedUnidades] = useState([]);
    const [selectedMunicipios, setSelectedMunicipios] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedModalidades, setSelectedModalidades] = useState([SEM_MODALIDADE_OPTION]);

    const showNotification = useNotification();
    const updateStatusMutation = useUpdateCursosStatusMutation();

    const { data: unidadesData, isLoading: isLoadingUnidades } = useGetUnidadesQuery();
    const { data: municipiosData, isLoading: isLoadingMunicipios } = useGetMunicipiosQuery();
    const { data: typesData, isLoading: isLoadingTypes } = useGetCursoTypesQuery();
    const { data: modalidadesData, isLoading: isLoadingModalidades } = useGetModalidadesQuery();

    const unidadesOptions = useMemo(() => {
        if (!unidadesData) return [];
        const unique = new Map();
        unidadesData.forEach(u => { if (!unique.has(u.nome)) unique.set(u.nome, { value: u.id, label: u.nome }); });
        return Array.from(unique.values());
    }, [unidadesData]);

    const municipiosOptions = useMemo(() => {
        if (!municipiosData) return [];
        const unique = new Map();
        municipiosData.forEach(m => { if (!unique.has(m.nome)) unique.set(m.nome, { value: m.id, label: m.nome }); });
        return Array.from(unique.values());
    }, [municipiosData]);

    const typesOptions = useMemo(() =>
        typesData?.filter(Boolean).map(t => ({ value: t, label: t })) ?? [],
        [typesData]);

    const modalidadesOptions = useMemo(() => {
        const options = modalidadesData?.filter(Boolean).map(m => ({ value: m.id, label: m.mod_ensino || m.nome })) ?? [];
        return [SEM_MODALIDADE_OPTION, ...options];
    }, [modalidadesData]);

    const handleModalidadesChange = (nextValue = []) => {
        if (!Array.isArray(nextValue) || nextValue.length === 0) {
            setSelectedModalidades([SEM_MODALIDADE_OPTION]);
            return;
        }

        const selectedReal = nextValue.filter(item => item?.value !== SEM_MODALIDADE_OPTION.value);
        if (selectedReal.length > 0) {
            setSelectedModalidades(selectedReal);
            return;
        }

        setSelectedModalidades([SEM_MODALIDADE_OPTION]);
    };

    // filtroStatus → query param server-side
    const extraParams = useMemo(() => {
        if (filtroStatus === 'ATIVOS') return { ativo: 'true' };
        if (filtroStatus === 'INATIVOS') return { ativo: 'false' };
        return {};
    }, [filtroStatus]);

    const modalidadeParams = useMemo(() => {
        const selectedReal = selectedModalidades.filter(item => item?.value !== SEM_MODALIDADE_OPTION.value);
        if (selectedReal.length > 0) {
            return { modalidadeIds: selectedReal.map(item => item.value).join(',') };
        }

        return { unclassified: 'true' };
    }, [selectedModalidades]);

    const queryExtraParams = useMemo(() => ({ ...extraParams, ...modalidadeParams }), [extraParams, modalidadeParams]);

    const selectedSemClassificacao = currentItems.filter(
        c => selectedIds.some(id => String(id) === String(c.id)) && !c.modalidade_rel
    );
    const canClassificar = selectedSemClassificacao.length > 0;
    const canAtivar = filtroStatus === 'INATIVOS' && selectedIds.length > 0;
    const canInativar = filtroStatus === 'ATIVOS' && selectedIds.length > 0;

    const handleAtivar = () => {
        updateStatusMutation.mutate({ cursoIds: selectedIds, ativo: true }, {
            onSuccess: () => { showNotification(`${selectedIds.length} curso(s) ativado(s)!`, 'success'); setSelectedIds([]); },
            onError: () => showNotification('Erro ao ativar cursos.', 'error'),
        });
    };

    const handleInativar = () => {
        updateStatusMutation.mutate({ cursoIds: selectedIds, ativo: false }, {
            onSuccess: () => { showNotification(`${selectedIds.length} curso(s) inativado(s)!`, 'success'); setSelectedIds([]); },
            onError: () => showNotification('Erro ao inativar cursos.', 'error'),
        });
    };

    return (
        <>
            <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{ width: '100%' }}>

                {/* ── Cabeçalho ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px' }}>Cursos</h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Gerencie os cursos cadastrados, suas modalidades e situação</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => canClassificar && setModalAberto(true)} disabled={!canClassificar}
                            style={{ ...btnBase, background: '#1d4ed8', color: '#fff', opacity: canClassificar ? 1 : 0.45, cursor: canClassificar ? 'pointer' : 'not-allowed' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            Classificar Curso
                        </button>
                        <button onClick={handleAtivar} disabled={!canAtivar || updateStatusMutation.isPending}
                            style={{ ...btnBase, background: '#1D5E24', color: '#fff', opacity: canAtivar ? 1 : 0.45, cursor: canAtivar ? 'pointer' : 'not-allowed' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Ativar Curso
                        </button>
                        <button onClick={handleInativar} disabled={!canInativar || updateStatusMutation.isPending}
                            style={{ ...btnBase, background: '#374151', color: '#fff', opacity: canInativar ? 1 : 0.45, cursor: canInativar ? 'pointer' : 'not-allowed' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                            Inativar Curso
                        </button>
                    </div>
                </div>

                {/* ── Filtros Avançados ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div>
                        <label style={filterLabelStyle}>Municípios Vínculo</label>
                        <AnimatedMultiSelect placeholder="Selecione os municípios" options={municipiosOptions} value={selectedMunicipios} onChange={setSelectedMunicipios} disabled={isLoadingMunicipios} />
                    </div>
                    <div>
                        <label style={filterLabelStyle}>Unidade Responsável</label>
                        <AnimatedMultiSelect placeholder="Selecione as unidades" options={unidadesOptions} value={selectedUnidades} onChange={setSelectedUnidades} disabled={isLoadingUnidades} />
                    </div>
                    <div>
                        <label style={filterLabelStyle}>Tipo de Curso</label>
                        <AnimatedMultiSelect placeholder="Selecione os tipos" options={typesOptions} value={selectedTypes} onChange={setSelectedTypes} disabled={isLoadingTypes} />
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20, flexWrap: 'wrap', width: '100%' }}>
                    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 10, flexShrink: 0 }}>
                        {FILTROS.map(f => (
                            <button key={f} onClick={() => setFiltroStatus(f)} style={{
                                padding: '6px 14px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.3px', transition: 'all 150ms ease',
                                background: filtroStatus === f ? '#fff' : 'transparent',
                                color: filtroStatus === f ? (f === 'ATIVOS' ? '#1D5E24' : f === 'INATIVOS' ? '#374151' : '#1a202c') : '#64748b',
                                boxShadow: filtroStatus === f ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                            }}>{f}</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', flex: '1 1 280px', minWidth: 280, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = '#1D5E24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,94,36,0.1)'; }}
                        onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Pesquisar por nome ou código..."
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1a202c', width: '100%', fontFamily: 'inherit' }} />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        )}
                    </div>
                    <div style={{ minWidth: 320, flex: '0 1 420px', maxWidth: 420 }}>
                        <label style={filterLabelStyle}>Modalidade</label>
                        <AnimatedMultiSelect
                            placeholder="Selecione uma ou mais modalidades"
                            options={modalidadesOptions}
                            value={selectedModalidades}
                            onChange={handleModalidadesChange}
                            disabled={isLoadingModalidades}
                            sx={{ mt: 0 }}
                        />
                    </div>
                </div>

                {/* ── Tabela ── */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', animation: 'fadeInUp 400ms 150ms both' }}>
                    <TableCursos
                        searchQuery={searchQuery}
                        extraParams={queryExtraParams}
                        unidadeIds={selectedUnidades.map(u => u.value)}
                        municipioIds={selectedMunicipios.map(m => m.value)}
                        selectedTypes={selectedTypes.map(t => t.value)}
                        modalidadeOptions={modalidadesOptions}
                        unidadesOptions={unidadesOptions}
                        municipiosOptions={municipiosOptions}
                        typesOptions={typesOptions}
                        onSelectionChange={setSelectedIds}
                        onItemsLoaded={setCurrentItems}
                    />
                </div>
            </div>

            <ModalClassificarCursos
                show={modalAberto}
                onHide={() => setModalAberto(false)}
                cursoIds={selectedSemClassificacao.map(c => c.id)}
                onSuccess={(msg) => { showNotification(msg || 'Operação realizada!', 'success'); setSelectedIds([]); }}
            />
        </>
    );
};

export default Cursos;