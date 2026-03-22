// src/components/Tables/TableAdmins.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNotification } from '../../context/NotificationContext';
import ModalAdmin from '../Modals/Modal_Admin';
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, IconButton, Tooltip, Typography, Skeleton } from '@mui/material';

import { useGetAdminsQuery } from '../../hooks/queries/useAdminQueries';
import { useDeleteAdminMutation } from '../../hooks/mutations/useAdminMutations';

const TableAdmins = ({ searchQuery = '', onSuccess }) => {
    const { data: admins = [], isLoading: loadingTable, isError } = useGetAdminsQuery();
    const deleteAdminMutation = useDeleteAdminMutation();
    const showNotification = useNotification();

    const [modalShow, setModalShow] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAdmin, setDeletingAdmin] = useState(null);

    useEffect(() => {
        if (isError) {
            showNotification('Erro ao carregar administradores.', 'error');
        }
    }, [isError, showNotification]);

    const handleUpdateAdmin = (admin) => {
        setSelectedAdmin(admin);
        setModalShow(true);
    };

    const handleDeleteRequest = (admin) => {
        setDeletingAdmin(admin);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingAdmin) return;
        deleteAdminMutation.mutate(deletingAdmin.id, {
            onSuccess: () => {
                showNotification(`Admin "${deletingAdmin.email}" removido com sucesso!`, 'success');
                setShowDeleteModal(false);
                setDeletingAdmin(null);
                if (onSuccess) onSuccess();
            },
            onError: (error) => {
                showNotification(error.response?.data?.error || 'Erro ao remover admin. Tente novamente.', 'error');
            }
        });
    };

    const handleAdminSaved = (message) => {
        setModalShow(false);
        if (onSuccess) onSuccess(message || 'Admin salvo com sucesso!');
    };

    const rows = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return admins.filter(a =>
            (a.email || '').toLowerCase().includes(q) ||
            (a.nome || '').toLowerCase().includes(q)
        );
    }, [admins, searchQuery]);

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90,
            renderCell: (params) => (
                <Typography variant="caption" sx={{
                    fontFamily: 'monospace',
                    bgcolor: '#f1f5f9',
                    px: 1, py: 0.5,
                    borderRadius: 1,
                    border: '1px solid #e2e8f0'
                }}>
                    #{params.value}
                </Typography>
            )
        },
        { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 200 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 120,
            sortable: false,
            filterable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
                    <Tooltip title="Editar">
                        <IconButton
                            size="small"
                            onClick={() => handleUpdateAdmin(params.row)}
                            sx={{ color: '#1D5E24', '&:hover': { bgcolor: '#e8f5e9' } }}
                        >
                            <FaRegEdit size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton
                            size="small"
                            onClick={() => handleDeleteRequest(params.row)}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                        >
                            <IoTrashOutline size={16} />
                        </IconButton>
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
                disableRowSelectionOnClick
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                sx={{
                    border: 'none',
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

            <ModalAdmin
                show={modalShow}
                onHide={() => setModalShow(false)}
                admin={selectedAdmin}
                onSuccess={handleAdminSaved}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false)}
                message={deletingAdmin ? `Tem certeza que deseja remover o administrador "${deletingAdmin.email}"?` : ""}
                loading={deleteAdminMutation.isPending}
            />
        </Box>
    );
};

export default TableAdmins;
