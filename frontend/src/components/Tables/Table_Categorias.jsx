// src/components/Tables/Table_Categorias.jsx
import React, { useEffect, useMemo } from "react";
import { useGetCategoriasQuery } from "../../hooks/queries/useCategoriaQueries";
import { useNotification } from "../../context/NotificationContext";
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, Typography } from '@mui/material';

const Table_Categorias = ({ searchQuery = '', onSuccess }) => {
    const { data: datacategorias = [], isLoading: loadingTable, isError } = useGetCategoriasQuery();
    const showNotification = useNotification();

    useEffect(() => { if (isError) showNotification('Erro ao carregar categorias.', 'error'); }, [isError, showNotification]);

    const rows = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return datacategorias.filter(c =>
            (c.nome || '').toLowerCase().includes(q)
        );
    }, [datacategorias, searchQuery]);

    const columns = [
        {
            field: 'id',
            headerName: '#',
            width: 80,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{
                        fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #e2e8f0'
                    }}>
                        #{params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'nome',
            headerName: 'Nome',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'data_criacao',
            headerName: 'Data de Criação',
            width: 150,
            valueGetter: (value) => new Date(value).toLocaleDateString()
        },
    ];

    return (
        <Box sx={{ width: '100%', height: 600 }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loadingTable}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                density="compact"
                disableRowSelectionOnClick
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    },
                    '& .MuiDataGrid-cell:focus': { outline: 'none' },
                    '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
                    '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        textTransform: 'uppercase',
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#718096',
                            letterSpacing: '0.5px'
                        }
                    }
                }}
            />
        </Box>
    );
};

export default Table_Categorias;
