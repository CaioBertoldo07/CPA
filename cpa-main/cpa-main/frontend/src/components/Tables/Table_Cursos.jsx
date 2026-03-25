import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Typography,
    Chip,
    FormControlLabel,
    Switch,
    Tooltip,
} from '@mui/material';
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport, GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { IoSearchOutline, IoEyeOutline } from 'react-icons/io5';
import { useGetPaginatedCursosQuery, useGetCursoTypesQuery } from '../../hooks/queries/useCursoQueries';
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';

const CustomToolbar = ({ searchTerm, setSearchTerm, selectedTypes, handleTypeChange, typeOptions, isLoadingTypes, setPage, isExternal }) => {
    return (
        <GridToolbarContainer sx={{ p: isExternal ? 1 : 2, display: 'flex', flexDirection: 'column', gap: isExternal ? 1 : 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 2 }}>
                {/* Standardized Search Bar (Only if not external) */}
                {!isExternal && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        background: '#fff', 
                        border: '1.5px solid #e2e8f0', 
                        borderRadius: '10px', 
                        padding: '8px 16px', 
                        width: '100%',
                        maxWidth: 420, 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        '&:focus-within': {
                            borderColor: '#1D5E24',
                            boxShadow: '0 0 0 3px rgba(29,94,36,0.1)'
                        }
                    }}>
                        <IoSearchOutline color="#9ca3af" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(0);
                            }} 
                            placeholder="Pesquisar cursos ou códigos..." 
                            style={{ 
                                border: 'none', 
                                outline: 'none', 
                                background: 'transparent', 
                                fontSize: '13px', 
                                color: '#1a202c', 
                                width: '100%', 
                                fontFamily: 'inherit' 
                            }} 
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => { setSearchTerm(''); setPage(0); }} 
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        )}
                    </Box>
                )}

                {/* External MultiSelect (Sync with Column Filter) */}
                <Box sx={{ width: isExternal ? '100%' : '300px' }}>
                    <AnimatedMultiSelect
                        placeholder="Filtrar por tipo..."
                        options={typeOptions}
                        value={selectedTypes}
                        onChange={handleTypeChange}
                        disabled={isLoadingTypes}
                    />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
            </Box>
        </GridToolbarContainer>
    );
};

const Table_Cursos = ({ searchQuery: externalSearch = '', externalSelectedTypes = [], onExternalTypesChange }) => {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState(externalSearch);
    const [selectedTypes, setSelectedTypes] = useState(externalSelectedTypes);
    const [filterModel, setFilterModel] = useState({
        items: [],
    });

    const { data: typesData, isLoading: isLoadingTypes } = useGetCursoTypesQuery();
    const typeOptions = typesData?.map(t => ({ value: t, label: t })) || [];

    // Sync internal state with external props
    useEffect(() => {
        setSearchTerm(externalSearch);
    }, [externalSearch]);

    useEffect(() => {
        setSelectedTypes(externalSelectedTypes);
    }, [externalSelectedTypes]);

    // Notify parent of internal changes if handler provided
    const handleTypeChange = (newTypes) => {
        const types = Array.isArray(newTypes) ? newTypes : [];
        setSelectedTypes(types);
        if (onExternalTypesChange) onExternalTypesChange(types);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    // Sync external search box -> filterModel
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilterModel(prev => {
                const otherItems = prev.items.filter(item => item.field !== 'nome');
                if (!searchTerm) return { ...prev, items: otherItems };
                return {
                    ...prev,
                    items: [...otherItems, { field: 'nome', operator: 'contains', value: searchTerm }]
                };
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Sync external types -> filterModel
    useEffect(() => {
        setFilterModel(prev => {
            const otherItems = prev.items.filter(item => item.field !== 'curso_tipo');
            if (selectedTypes.length === 0) return { ...prev, items: otherItems };
            return {
                ...prev,
                items: [...otherItems, {
                    field: 'curso_tipo',
                    operator: 'contains',
                    value: selectedTypes.map(t => t.value).join(', ')
                }]
            };
        });
    }, [selectedTypes]);

    const queryFilters = useMemo(() => {
        const filters = {};
        filterModel.items.forEach(item => {
            if (item.field === 'nome') filters.nome = item.value;
            if (item.field === 'curso_tipo') {
                filters.curso_tipo = item.value;
            }
            if (item.field === 'identificador_api_lyceum') filters.codigo = item.value;
        });
        return filters;
    }, [filterModel]);

    const { data: response, isLoading } = useGetPaginatedCursosQuery({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        ...queryFilters
    });

    const rows = response?.items || [];
    const totalCount = response?.totalCount || 0;

    const columns = [
        {
            field: 'identificador_api_lyceum',
            headerName: 'Código',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'nome',
            headerName: 'Nome do Curso',
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'curso_tipo',
            headerName: 'Tipo (Lyceum)',
            width: 250,
            renderHeader: () => (
                <Box sx={{ width: '100%', pr: 2 }}>
                    <AnimatedMultiSelect
                        placeholder="Tipo"
                        options={typeOptions}
                        value={selectedTypes}
                        onChange={handleTypeChange}
                        disabled={isLoadingTypes}
                        compact
                    />
                </Box>
            ),
            renderCell: (params) => params.value ? (
                <Chip label={params.value} size="small" variant="outlined" />
            ) : '—'
        },
        {
            field: 'modalidade_rel',
            headerName: 'Modalidade (Classific.)',
            width: 200,
            valueGetter: (params, row) => row.modalidade_rel?.mod_ensino || 'Não Classificado',
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'Não Classificado' ? 'default' : 'primary'}
                    variant={params.value === 'Não Classificado' ? 'outlined' : 'filled'}
                />
            )
        },
        {
            field: 'unidades',
            headerName: 'Unidade / Município',
            width: 250,
            renderCell: (params) => (
                <Box>
                    <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
                        {params.row.unidades?.nome || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.municipio?.nome || '—'} {params.row.municipio?.UF ? `(${params.row.municipio.UF})` : ''}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'ativo',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Ativo' : 'Inativo'}
                    size="small"
                    color={params.value ? 'success' : 'error'}
                    sx={{ fontWeight: 700 }}
                />
            )
        }
    ];

    const slotProps = useMemo(() => ({
        toolbar: {
            searchTerm,
            setSearchTerm,
            selectedTypes,
            handleTypeChange,
            typeOptions,
            isLoadingTypes,
            setPage: (p) => setPaginationModel(prev => ({ ...prev, page: p })),
            isExternal: !!externalSearch
        }
    }), [searchTerm, selectedTypes, typeOptions, isLoadingTypes, externalSearch]);

    return (
        <Box sx={{ width: '100%' }}>
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
                onFilterModelChange={(newModel) => {
                    setFilterModel(newModel);
                    setPaginationModel(prev => ({ ...prev, page: 0 }));

                    // Sync GRID -> EXTERNAL search
                    const nomeFilter = newModel.items.find(i => i.field === 'nome');
                    if (nomeFilter) {
                        if (nomeFilter.value !== searchTerm) setSearchTerm(nomeFilter.value || '');
                    } else if (searchTerm && !newModel.items.find(i => i.field === 'nome')) {
                        setSearchTerm('');
                    }
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                autoHeight
                slots={{
                    toolbar: CustomToolbar
                }}
                slotProps={slotProps}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': { outline: 'none' },
                    '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                }}
            />
        </Box>
    );
};

export default Table_Cursos;
