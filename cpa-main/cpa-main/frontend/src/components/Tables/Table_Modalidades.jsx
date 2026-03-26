import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../../context/NotificationContext';
import EditModal from '../Modals/ModalUpdateModalidades';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';
import Modal_IncluirCursos from '../Modals/Modal_IncluirCursos';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useDeleteModalidadeMutation } from '../../hooks/mutations/useModalidadeMutations';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, IconButton, Tooltip, Typography, Chip, Button } from '@mui/material';

const Table_Modalidades = ({ searchQuery = '', onSuccess }) => {
    const { data: modalidades = [], isLoading: loading, isError } = useGetModalidadesQuery();
    const deleteMutation = useDeleteModalidadeMutation();
    const showNotification = useNotification();

    const [editingModalidade, setEditingModalidade] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingModalidade, setDeletingModalidade] = useState(null);

    const [showIncludeModal, setShowIncludeModal] = useState(false);
    const [selectingModalidade, setSelectingModalidade] = useState(null);

    useEffect(() => { if (isError) showNotification('Erro ao carregar modalidades.', 'error'); }, [isError, showNotification]);

    const handleEdit = (modalidade) => {
        setEditingModalidade(modalidade);
        setShowEditModal(true);
    };

    const handleEditSave = (message) => {
        setShowEditModal(false);
        if (onSuccess) onSuccess(message);
    };

    const handleDeleteRequest = (modalidade) => {
        setDeletingModalidade(modalidade);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (!deletingModalidade) return;
        deleteMutation.mutate(deletingModalidade.id, {
            onSuccess: () => {
                if (onSuccess) onSuccess(`Modalidade "${deletingModalidade.mod_ensino}" excluída com sucesso!`);
                setShowDeleteModal(false);
                setDeletingModalidade(null);
            },
            onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao excluir modalidade. Tente novamente.', 'error')
        });
    };

    const rows = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return modalidades.filter(m =>
            (m.mod_ensino || '').toLowerCase().includes(q) ||
            (m.mod_oferta || '').toLowerCase().includes(q)
        );
    }, [modalidades, searchQuery]);

    const columns = [
        {
            field: 'mod_ensino',
            headerName: 'Modalidade de ensino',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography>
        },
        {
            field: 'num_questoes',
            headerName: 'Num. questões',
            width: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                        label={`${params.value} questões`}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: 600, border: '1px solid #e2e8f0', height: 20, '& .MuiChip-label': { px: 1, display: 'flex', alignItems: 'center' } }}
                    />
                </Box>
            )
        },
        {
            field: 'data_criacao',
            headerName: 'Data de criação',
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
                            onClick={() => handleEdit(params.row)}
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
                    <Tooltip title="Gerenciar Cursos">
                        <Button
                            size="small"
                            variant="text"
                            startIcon={<HiOutlineDocumentSearch size={16} />}
                            onClick={() => {
                                setSelectingModalidade(params.row);
                                setShowIncludeModal(true);
                            }}
                            sx={{
                                color: '#2b6cb0',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                '&:hover': { bgcolor: '#ebf4ff' }
                            }}
                        >
                            Cursos
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
                loading={loading}
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

            {editingModalidade && (
                <EditModal
                    show={showEditModal}
                    modalidade={editingModalidade}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditSave}
                />
            )}

            <ConfirmDeleteModal
                show={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false)}
                message={deletingModalidade ? `Tem certeza que deseja excluir a modalidade "${deletingModalidade.mod_ensino}"?` : ""}
                loading={deleteMutation.isPending}
            />

            {selectingModalidade && (
                <Modal_IncluirCursos
                    show={showIncludeModal}
                    onHide={() => setShowIncludeModal(false)}
                    modalityId={selectingModalidade.id}
                    modalityName={selectingModalidade.mod_ensino}
                />
            )}
        </Box>
    );
};

export default Table_Modalidades;
