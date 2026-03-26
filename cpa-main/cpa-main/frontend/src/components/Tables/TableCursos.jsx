import { useState, useMemo, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, Chip, Typography } from '@mui/material';
import { useGetPaginatedCursosQuery } from '../../hooks/queries/useCursoQueries';
import { useNotification } from '../../context/NotificationContext';

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

const columns = [
    {
        field: 'identificador_api_lyceum',
        headerName: 'Código',
        width: 130,
        renderCell: ({ value }) => (
            <Typography variant="caption" sx={{
                fontFamily: 'monospace', bgcolor: '#f1f5f9',
                px: 1, py: 0.25, borderRadius: 1,
                border: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b',
            }}>
                {value ?? '—'}
            </Typography>
        ),
    },
    {
        field: 'nome',
        headerName: 'Nome',
        flex: 1,
        minWidth: 220,
        renderCell: ({ value }) => (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
        ),
    },
    {
        field: 'curso_tipo',
        headerName: 'Tipo de Curso',
        width: 175,
        valueGetter: (_, row) => row.curso_tipo || null,
        renderCell: ({ value }) => value
            ? <Chip label={value} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: '0.7rem', border: 'none' }} />
            : <Chip label="Sem tipo" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '0.7rem', border: 'none' }} />,
    },
    {
        field: 'modalidade_rel',
        headerName: 'Modalidade',
        width: 175,
        renderCell: ({ row }) => {
            const rel = row.modalidade_rel;
            const temDados = rel?.mod_ensino || rel?.mod_oferta;
            return temDados
                ? <Chip label={`${rel.mod_ensino ?? ''} - ${rel.mod_oferta ?? ''}`} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.7rem', border: 'none' }} />
                : <Chip label="Sem modalidade" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '0.7rem', border: 'none' }} />;
        },
    },
    {
        field: 'unidades',
        headerName: 'Cidade',
        width: 150,
        valueGetter: (_, row) => row.unidades?.nome ?? '—',
    },
    {
        field: 'municipio',
        headerName: 'Município',
        width: 160,
        valueGetter: (_, row) => row.municipio?.nome ?? '—',
    },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 110,
        renderCell: ({ value }) => (
            <Chip
                label={value ? 'Ativo' : 'Inativo'}
                size="small"
                sx={value
                    ? { bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.7rem', border: 'none' }
                    : { bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '0.7rem', border: 'none' }
                }
            />
        ),
    },
];

const TableCursos = ({
    searchQuery = '',
    selectedTypes = [],
    unidadeIds = [],
    municipioIds = [],
    extraParams = {},
    onSelectionChange,
    onItemsLoaded,
}) => {
    const showNotification = useNotification();

    const [paginationModel, setPaginationModel] = useState({ page: 1, pageSize: 10 });

    const queryParams = useMemo(() => ({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        ...(searchQuery ? { nome: searchQuery } : {}),
        ...(selectedTypes.length > 0 ? { curso_tipo: selectedTypes.join(',') } : {}),
        ...(unidadeIds.length > 0 ? { unidadeIds: unidadeIds.join(',') } : {}),
        ...(municipioIds.length > 0 ? { municipioIds: municipioIds.join(',') } : {}),
        ...extraParams,
    }), [paginationModel, searchQuery, selectedTypes, unidadeIds, municipioIds, extraParams]);

    const { data, isLoading, isError } = useGetPaginatedCursosQuery(queryParams);

    const items = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;

    useEffect(() => {
        if (isError) showNotification('Erro ao carregar cursos.', 'error');
    }, [isError, showNotification]);

    useEffect(() => {
        onItemsLoaded?.(items);
    }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectionChange = (model) => {
        const ids = Array.isArray(model) ? model : (model?.ids ? Array.from(model.ids) : []);
        onSelectionChange?.(ids);
    };

    const filterModel = useMemo(() => {
        const items = [];
        if (searchQuery) items.push({ field: 'nome', operator: 'contains', value: searchQuery });
        if (selectedTypes.length > 0) items.push({ field: 'curso_tipo', operator: 'contains', value: selectedTypes[0] });
        if (extraParams?.ativo) items.push({ field: 'ativo', operator: 'contains', value: extraParams.ativo });
        return { items };
    }, [searchQuery, selectedTypes, extraParams]);

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={items}
                columns={columns}
                getRowId={(row) => row.id}
                loading={isLoading}
                checkboxSelection
                disableRowSelectionOnClick
                density="compact"
                autoHeight
                paginationMode="server"
                filterMode="server"
                rowCount={totalCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 20, 50, 100]}

                filterModel={filterModel}
                onFilterModelChange={() => { }}

                onRowSelectionModelChange={handleSelectionChange}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                sx={dataGridSx}
            />
        </Box>
    );
};

export default TableCursos;