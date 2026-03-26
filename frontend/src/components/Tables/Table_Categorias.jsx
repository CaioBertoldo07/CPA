// src/components/Tables/Table_Categorias.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useGetCategoriasQuery } from "../../hooks/queries/useCategoriaQueries";
import { useDeleteCategoriaMutation } from "../../hooks/mutations/useCategoriaMutations";
import { useNotification } from "../../context/NotificationContext";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ModalCategorias from '../Modals/Modal_Categorias';
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, IconButton, Tooltip, Typography, Button } from '@mui/material';

const Table_Categorias = ({ searchQuery = '', onSuccess }) => {
    const { data: datacategorias = [], isLoading: loadingTable, isError } = useGetCategoriasQuery();
    const deleteMutation = useDeleteCategoriaMutation();
    const showNotification = useNotification();

    const [modalShow, setModalShow] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCategoria, setDeletingCategoria] = useState(null);

    useEffect(() => { if (isError) showNotification('Erro ao carregar categorias.', 'error'); }, [isError, showNotification]);

    const handleUpdateCategoria = (categoria) => {
        setSelectedCategoria(categoria);
        setModalShow(true);
    };

    const handleDeleteRequest = (categoria) => {
        setDeletingCategoria(categoria);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCategoria) return;
        deleteMutation.mutate(deletingCategoria.id, {
            onSuccess: () => {
                if (onSuccess) onSuccess(`Categoria "${deletingCategoria.nome}" excluída com sucesso!`);
                setShowDeleteModal(false);
                setDeletingCategoria(null);
            },
            onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao excluir categoria. Tente novamente.', 'error')
        });
    };

    const handleCategoriaSaved = (message) => {
        setModalShow(false);
        if (onSuccess) onSuccess(message);
    };

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
        { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 200, renderCell: (params) => <Box sx={{ display: 'flex', alignItems: 'center' }}><Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography></Box> },
        {
            field: 'data_criacao',
            headerName: 'Data de Criação',
            width: 150,
            valueGetter: (value) => new Date(value).toLocaleDateString()
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 200,
            sortable: false,
            filterable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                    <Tooltip title="Editar">
                        <Button
                            size="small"
                            variant="text"
                            startIcon={<FaRegEdit size={14} />}
                            onClick={() => handleUpdateCategoria(params.row)}
                            sx={{
                                color: '#1D5E24',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                '&:hover': { bgcolor: '#e8f5e9' }
                            }}
                        >
                            Editar
                        </Button>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <Button
                            size="small"
                            variant="text"
                            color="error"
                            startIcon={<IoTrashOutline size={15} />}
                            onClick={() => handleDeleteRequest(params.row)}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                '&:hover': { bgcolor: '#fee2e2' }
                            }}
                        >
                            Excluir
                        </Button>
                    </Tooltip>
                </Box>
            )
        }
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

            <ModalCategorias
                show={modalShow}
                onHide={() => setModalShow(false)}
                categoria={selectedCategoria}
                onSuccess={handleCategoriaSaved}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setShowDeleteModal(false); setDeletingCategoria(null); }}
                message={deletingCategoria ? `Tem certeza que deseja excluir a categoria "${deletingCategoria.nome}"?` : ""}
                loading={deleteMutation.isPending}
            />
        </Box>
    );
};

export default Table_Categorias;
