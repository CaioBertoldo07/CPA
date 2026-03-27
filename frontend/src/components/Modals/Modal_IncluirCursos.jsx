import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material';
import { IoSearchOutline } from 'react-icons/io5';
import MuiBaseModal from '../utils/MuiBaseModal';
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import TableCursos from '../Tables/TableCursos';
import { useGetCursoTypesQuery } from '../../hooks/queries/useCursoQueries';
import { useGetUnidadesQuery } from '../../hooks/queries/useUnidadeQueries';
import { useGetMunicipiosQuery } from '../../hooks/queries/useMunicipioQueries';
import { useClassifyCursosMutation } from '../../hooks/mutations/useCursoMutations';
import { useNotification } from '../../context/NotificationContext';

const filterLabelStyle = {
    fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block'
};

const Modal_IncluirCursos = ({ show, onHide, modalityId, modalityName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedUnidades, setSelectedUnidades] = useState([]);
    const [selectedMunicipios, setSelectedMunicipios] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const showNotification = useNotification();
    const classifyMutation = useClassifyCursosMutation();

    const { data: typesData, isLoading: isLoadingTypes } = useGetCursoTypesQuery();
    const { data: unidadesData, isLoading: isLoadingUnidades } = useGetUnidadesQuery();
    const { data: municipiosData, isLoading: isLoadingMunicipios } = useGetMunicipiosQuery();

    const typesOptions = useMemo(
        () => typesData?.filter(Boolean).map(t => ({ value: t, label: t })) ?? [],
        [typesData]
    );

    const unidadesOptions = useMemo(() => {
        const unique = new Map();
        (unidadesData ?? []).forEach(u => {
            if (u?.nome && !unique.has(u.nome)) unique.set(u.nome, { value: u.id, label: u.nome });
        });
        return Array.from(unique.values());
    }, [unidadesData]);

    const municipiosOptions = useMemo(() => {
        const unique = new Map();
        (municipiosData ?? []).forEach(m => {
            if (m?.nome && !unique.has(m.nome)) unique.set(m.nome, { value: m.id, label: m.nome });
        });
        return Array.from(unique.values());
    }, [municipiosData]);

    // Reset state when modal closes
    useEffect(() => {
        if (!show) {
            setSelectedIds([]);
            setSearchTerm('');
            setSelectedTypes([]);
            setSelectedUnidades([]);
            setSelectedMunicipios([]);
        }
    }, [show]);

    const handleInclude = () => {
        if (selectedIds.length === 0) return;
        classifyMutation.mutate({ cursoIds: selectedIds, idModalidade: modalityId }, {
            onSuccess: () => {
                showNotification(`${selectedIds.length} curso(s) incluído(s) com sucesso!`, 'success');
                onHide();
            },
            onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao incluir cursos.', 'error')
        });
    };

    const modalActions = (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onHide} color="inherit">Cancelar</Button>
            <Button
                onClick={handleInclude}
                variant="contained"
                color="primary"
                disabled={selectedIds.length === 0 || classifyMutation.isPending}
                startIcon={classifyMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
            >
                Incluir Selecionados ({selectedIds.length})
            </Button>
        </Box>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={onHide}
            title={`Incluir Cursos em: ${modalityName}`}
            actions={modalActions}
            maxWidth="lg"
        >
            <Box sx={{ width: '100%' }}>

                {/* ── Filtros Avançados ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16, padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div>
                        <label style={filterLabelStyle}>Município Vínculo</label>
                        <AnimatedMultiSelect
                            placeholder="Selecione os municípios"
                            options={municipiosOptions}
                            value={selectedMunicipios}
                            onChange={setSelectedMunicipios}
                            disabled={isLoadingMunicipios}
                        />
                    </div>
                    <div>
                        <label style={filterLabelStyle}>Unidade Responsável</label>
                        <AnimatedMultiSelect
                            placeholder="Selecione as unidades"
                            options={unidadesOptions}
                            value={selectedUnidades}
                            onChange={setSelectedUnidades}
                            disabled={isLoadingUnidades}
                        />
                    </div>
                    <div>
                        <label style={filterLabelStyle}>Tipo de Curso</label>
                        <AnimatedMultiSelect
                            placeholder="Selecione os tipos"
                            options={typesOptions}
                            value={selectedTypes}
                            onChange={setSelectedTypes}
                            disabled={isLoadingTypes}
                        />
                    </div>
                </div>

                {/* ── Busca ── */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.2,
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: '10px', padding: '10px 16px', mb: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    '&:focus-within': { borderColor: '#1D5E24', boxShadow: '0 0 0 3px rgba(29,94,36,0.1)' }
                }}>
                    <IoSearchOutline color="#9ca3af" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar por nome ou código..."
                        style={{
                            border: 'none', outline: 'none', background: 'transparent',
                            fontSize: 13, color: '#1a202c', width: '100%', fontFamily: 'inherit'
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </Box>

                {/* ── Tabela ── */}
                <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <TableCursos
                        searchQuery={searchTerm}
                        selectedTypes={selectedTypes.map(t => t.value)}
                        unidadeIds={selectedUnidades.map(u => u.value)}
                        municipioIds={selectedMunicipios.map(m => m.value)}
                        typesOptions={typesOptions}
                        unidadesOptions={unidadesOptions}
                        municipiosOptions={municipiosOptions}
                        extraParams={{ unclassified: 'true' }}
                        onSelectionChange={setSelectedIds}
                    />
                </Box>

            </Box>
        </MuiBaseModal>
    );
};

export default Modal_IncluirCursos;
