import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { IoSearchOutline } from 'react-icons/io5';
import MuiBaseModal from '../utils/MuiBaseModal';
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import TableCursos from '../Tables/TableCursos';
import { useGetCursoTypesQuery } from '../../hooks/queries/useCursoQueries';
import { useClassifyCursosMutation } from '../../hooks/mutations/useCursoMutations';
import { useNotification } from '../../context/NotificationContext';

const Modal_IncluirCursos = ({ show, onHide, modalityId, modalityName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const showNotification = useNotification();
    const classifyMutation = useClassifyCursosMutation();

    const { data: typesData, isLoading: isLoadingTypes } = useGetCursoTypesQuery();
    const typeOptions = typesData?.map(t => ({ value: t, label: t })) || [];

    // Reset state when modal closes
    useEffect(() => {
        if (!show) {
            setSelectedIds([]);
            setSearchTerm('');
            setSelectedTypes([]);
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
                {/* Search and Filters Bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
                    {/* Search Bar */}
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.2, background: '#fff', border: '1.5px solid #e2e8f0',
                        borderRadius: '10px', padding: '10px 16px', flex: 1, maxWidth: 450, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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

                    {/* Filter by Course Type */}
                    <Box sx={{ width: '300px' }}>
                        <AnimatedMultiSelect
                            placeholder="Filtrar por tipo..."
                            options={typeOptions}
                            value={selectedTypes}
                            onChange={setSelectedTypes}
                            disabled={isLoadingTypes}
                        />
                    </Box>
                </Box>

                {/* Course List Table */}
                <Box sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <TableCursos
                        searchQuery={searchTerm}
                        selectedTypes={selectedTypes.map(t => t.value)}
                        extraParams={{ unclassified: 'true' }}
                        pageSize={10}
                        onSelectionChange={setSelectedIds}
                    />
                </Box>
            </Box>
        </MuiBaseModal>
    );
};

export default Modal_IncluirCursos;
