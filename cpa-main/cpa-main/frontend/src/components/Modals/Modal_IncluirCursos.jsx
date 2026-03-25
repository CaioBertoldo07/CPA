import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    Checkbox,
    Autocomplete,
    TextField as MuiTextField
} from '@mui/material';
import { 
    DataGrid, 
    GridToolbarContainer, 
    GridToolbarFilterButton, 
    GridToolbarColumnsButton, 
    GridToolbarDensitySelector,
    getGridStringOperators
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { IoSearchOutline } from 'react-icons/io5';
import MuiBaseModal from '../utils/MuiBaseModal';
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import { useGetPaginatedCursosQuery, useGetCursoTypesQuery } from '../../hooks/queries/useCursoQueries';
import { useClassifyCursosMutation } from '../../hooks/mutations/useCursoMutations';
import { useNotification } from '../../context/NotificationContext';

const MultiSelectFilterInput = ({ item, applyValue, apiRef }) => {
    const column = apiRef.current.getColumn(item.field);
    const options = column.valueOptions || [];
    
    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            value={item.value || []}
            onChange={(_, newValue) => applyValue({ ...item, value: newValue })}
            renderInput={(params) => (
                <MuiTextField {...params} label="Selecionar Tipos" variant="standard" size="small" />
            )}
            sx={{ minWidth: 200, mt: 1 }}
        />
    );
};

const cursoTipoOperators = [
    {
        label: 'é qualquer um de',
        value: 'isAnyOf',
        getApplyFilterFn: (filterItem) => {
            if (!filterItem.value?.length) return null;
            return (value) => filterItem.value.includes(value);
        },
        InputComponent: MultiSelectFilterInput,
    },
    ...getGridStringOperators().filter(op => ['contains', 'equals'].includes(op.value))
];

const Modal_IncluirCursos = ({ show, onHide, modalityId, modalityName }) => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    
    const showNotification = useNotification();
    const classifyMutation = useClassifyCursosMutation();

    const { data: typesData, isLoading: isLoadingTypes } = useGetCursoTypesQuery();
    const typeOptions = typesData?.map(t => ({ value: t, label: t })) || [];

    // Sync external Search/MultiSelect with filterModel
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilterModel(prev => {
                const items = [...(prev?.items || [])].filter(i => i.field !== 'nome' && i.field !== 'curso_tipo');
                
                if (searchTerm) {
                    items.push({ field: 'nome', operator: 'contains', value: searchTerm });
                }
                
                if (selectedTypes.length > 0) {
                    items.push({ 
                        field: 'curso_tipo', 
                        operator: 'isAnyOf', 
                        value: selectedTypes.map(t => t.value)
                    });
                }
                
                return { ...prev, items };
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedTypes]);

    const queryFilters = useMemo(() => {
        const filters = {};
        if (filterModel?.items) {
            filterModel.items.forEach(item => {
                if (item.field === 'nome') filters.nome = item.value;
                if (item.field === 'curso_tipo') {
                    filters.curso_tipo = Array.isArray(item.value) ? item.value.join(',') : item.value;
                }
            });
        }
        return filters;
    }, [filterModel]);

    const { data: response, isLoading, isError, error } = useGetPaginatedCursosQuery({
        page: paginationModel?.page || 0,
        pageSize: paginationModel?.pageSize || 10,
        unclassified: 'true',
        ...queryFilters
    });

    const rows = response?.items || [];
    const totalCount = response?.totalCount || 0;

    useEffect(() => {
        if (!show) {
            setSelectedIds([]);
            setPaginationModel({ page: 0, pageSize: 10 });
            setSearchTerm('');
            setSelectedTypes([]);
        }
    }, [show]);

    const handleInclude = () => {
        if (selectedIds.length === 0) return;
        classifyMutation.mutate({ cursoIds: selectedIds, idModalidade: modalityId }, {
            onSuccess: () => {
                showNotification(`${selectedIds.length} cursos incluídos!`, 'success');
                setSelectedIds([]);
                onHide();
            },
            onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao incluir.', 'error')
        });
    };

    const columns = [
        {
            field: 'select',
            headerName: '',
            width: 50,
            sortable: false,
            filterable: false,
            renderHeader: () => (
                <Checkbox 
                    indeterminate={rows.length > 0 && rows.some(r => selectedIds.includes(r.id)) && !rows.every(r => selectedIds.includes(r.id))}
                    checked={rows.length > 0 && rows.every(r => selectedIds.includes(r.id))}
                    onChange={(e) => {
                        if (e.target.checked) {
                            const newIds = rows.map(r => r.id);
                            setSelectedIds(prev => [...new Set([...prev, ...newIds])]);
                        } else {
                            const rowIds = rows.map(r => r.id);
                            setSelectedIds(prev => prev.filter(id => !rowIds.includes(id)));
                        }
                    }}
                />
            ),
            renderCell: (params) => (
                <Checkbox 
                    checked={selectedIds.includes(params.row.id)}
                    onChange={() => setSelectedIds(prev => prev.includes(params.row.id) ? prev.filter(i => i !== params.row.id) : [...prev, params.row.id])}
                    onClick={(e) => e.stopPropagation()}
                />
            )
        },
        { field: 'identificador_api_lyceum', headerName: 'Código', width: 120, renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography> },
        { field: 'nome', headerName: 'Nome do Curso', flex: 1, renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography> },
        { 
            field: 'curso_tipo', 
            headerName: 'Tipo', 
            width: 150,
            filterOperators: cursoTipoOperators,
            valueOptions: typeOptions.map(o => o.value),
            renderCell: (params) => params.value ? <Chip label={params.value} size="small" variant="outlined" /> : '—'
        },
        { 
            field: 'location', 
            headerName: 'Unidade / Município', 
            width: 250,
            renderCell: (params) => (
                <Box>
                    <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>{params.row.unidades?.nome || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{params.row.municipio?.nome || '—'}</Typography>
                </Box>
            )
        }
    ];

    const modalActions = (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onHide} color="inherit">Cancelar</Button>
            <Button onClick={handleInclude} variant="contained" color="primary" disabled={selectedIds.length === 0 || classifyMutation.isPending}>
                Incluir Selecionados ({selectedIds.length})
            </Button>
        </Box>
    );

    return (
        <MuiBaseModal open={show} onClose={onHide} title={`Incluir Cursos em: ${modalityName}`} actions={modalActions} maxWidth="lg">
            <Box sx={{ width: '100%', mb: 2 }}>
                {/* Standardized Search and Filter Layout */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
                    {/* External Search Bar */}
                    <Box sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1, background: '#fff', border: '1.5px solid #e2e8f0', 
                        borderRadius: '10px', padding: '10px 16px', flex: 1, maxWidth: 400, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        '&:focus-within': { borderColor: '#1D5E24', boxShadow: '0 0 0 3px rgba(29,94,36,0.1)' }
                    }}>
                        <IoSearchOutline color="#9ca3af" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            placeholder="Pesquisar por nome ou código..." 
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1a202c', width: '100%' }} 
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        )}
                    </Box>

                    {/* External MultiSelect (Sync with DataGrid Filter) */}
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

                <Box sx={{ height: 500, width: '100%' }}>
                    {isError && <Alert severity="error" sx={{ mb: 2 }}>{error?.message || 'Erro ao carregar cursos.'}</Alert>}
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        rowCount={totalCount}
                        loading={isLoading}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        filterMode="server"
                        filterModel={filterModel}
                        onFilterModelChange={(m) => {
                            setFilterModel(m);
                            setPaginationModel(prev => ({ ...prev, page: 0 }));
                        }}
                        disableRowSelectionOnClick
                        pageSizeOptions={[10, 25, 50, 100]}
                        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                        density="compact"
                        sx={{ border: 'none', '& .MuiDataGrid-cell:focus': { outline: 'none' }, height: '100%' }}
                    />
                </Box>
            </Box>
        </MuiBaseModal>
    );
};

export default Modal_IncluirCursos;
