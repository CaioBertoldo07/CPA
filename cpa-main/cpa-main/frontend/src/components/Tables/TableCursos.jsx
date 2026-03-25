import React, { useState, useMemo, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, Chip, Typography, IconButton } from '@mui/material';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useGetCursosPaginatedQuery } from '../../hooks/queries/useCursoQueries';
import { useNotification } from '../../context/NotificationContext';

const PAGE_SIZE = 20;

const dataGridSx = {
    border: 'none',
    '& .MuiDataGrid-cell:focus': { outline: 'none' },
    '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
    '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
    '& .MuiDataGrid-columnHeaders': {
        bgcolor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: 11,
            fontWeight: 600,
            color: '#718096',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
    },
};

const TableCursos = ({ searchQuery = '', filtroStatus = 'TODOS', onSelectionChange, onItemsLoaded }) => {
    const [page, setPage] = useState(1);
    const [selectionResetKey, setSelectionResetKey] = useState(0);
    const showNotification = useNotification();

    // Reseta página e seleção ao mudar busca ou filtro
    useEffect(() => {
        setPage(1);
        setSelectionResetKey(k => k + 1);
        onSelectionChange?.([]);
    }, [searchQuery, filtroStatus]);

    const queryParams = useMemo(() => ({
        page,
        pageSize: PAGE_SIZE,
        ...(searchQuery ? { nome: searchQuery } : {}),
    }), [page, searchQuery]);

    const { data, isLoading, isError } = useGetCursosPaginatedQuery(queryParams);

    const items      = data?.items      ?? [];
    const totalCount = data?.totalCount ?? 0;
    const totalPages = data?.totalPages ?? 1;

    useEffect(() => {
        if (isError) showNotification('Erro ao carregar cursos.', 'error');
    }, [isError, showNotification]);

    // Notifica o pai dos itens carregados (para o modal de classificação)
    useEffect(() => {
        onItemsLoaded?.(items);
    }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filtro de status client-side sobre os itens da página atual
    const rows = useMemo(() => {
        if (filtroStatus === 'ATIVOS')   return items.filter(c => c.ativo);
        if (filtroStatus === 'INATIVOS') return items.filter(c => !c.ativo);
        return items;
    }, [items, filtroStatus]);

    // Normaliza o modelo de seleção — MUI X DataGrid v7+ pode retornar
    // um array GridRowId[] ou o formato { type, ids: Set } (Pro)
    const handleSelectionChange = (model) => {
        const ids = Array.isArray(model)
            ? model
            : (model?.ids ? Array.from(model.ids) : []);
        onSelectionChange?.(ids);
    };

    const columns = [
        {
            field: 'identificador_api_lyceum',
            headerName: 'Código',
            width: 130,
            renderCell: (params) => (
                <Typography variant="caption" sx={{
                    fontFamily: 'monospace', bgcolor: '#f1f5f9',
                    px: 1, py: 0.25, borderRadius: 1,
                    border: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b',
                }}>
                    {params.value ?? '—'}
                </Typography>
            ),
        },
        {
            field: 'nome',
            headerName: 'Nome',
            flex: 1,
            minWidth: 220,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography>
            ),
        },
        {
            field: 'modalidade_rel',
            headerName: 'Modalidade',
            width: 175,
            valueGetter: (value) => value?.nome ?? null,
            renderCell: (params) => {
                const nome = params.row.modalidade_rel?.nome;
                return nome ? (
                    <Chip label={nome} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: '0.7rem', border: 'none' }} />
                ) : (
                    <Chip label="Sem classificação" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '0.7rem', border: 'none' }} />
                );
            },
        },
        {
            field: 'unidades',
            headerName: 'Cidade',
            width: 150,
            valueGetter: (value) => value?.nome ?? '—',
        },
        {
            field: 'municipio',
            headerName: 'Município',
            width: 160,
            valueGetter: (value) => value?.nome ?? '—',
        },
        {
            field: 'ativo',
            headerName: 'Status',
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Ativo' : 'Inativo'}
                    size="small"
                    sx={params.value
                        ? { bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.7rem', border: 'none' }
                        : { bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '0.7rem', border: 'none' }
                    }
                />
            ),
        },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                key={selectionResetKey}
                rows={rows}
                columns={columns}
                loading={isLoading}
                checkboxSelection
                disableRowSelectionOnClick
                autoHeight
                hideFooter
                density="compact"
                onRowSelectionModelChange={handleSelectionChange}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                sx={dataGridSx}
            />

            {/* Rodapé com total e controles de paginação */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 2, py: 1.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc',
            }}>
                <Typography variant="caption" color="text.secondary">
                    {totalCount} curso(s) no total
                </Typography>

                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                            <MdChevronLeft />
                        </IconButton>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', px: 0.5 }}>
                            {page} / {totalPages}
                        </Typography>
                        <IconButton size="small" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                            <MdChevronRight />
                        </IconButton>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TableCursos;
