// src/components/Tables/TableEixos.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import ModalUpdate from '../Modals/ModalUpdateEixo';
import ModalUpdateDimensao from '../Modals/ModalUpdateDimensao';
import ModalAddDimensao from '../Modals/ModalAddDimensao';
import { useNotification } from '../../context/NotificationContext';
import { FaRegEdit } from 'react-icons/fa';
import { IoTrashOutline } from 'react-icons/io5';
import { useGetEixosQuery } from '../../hooks/queries/useEixoQueries';
import { useDeleteEixoMutation } from '../../hooks/mutations/useEixoMutations';
import { useGetDimensoesByEixoQuery } from '../../hooks/queries/useDimensaoQueries';
import { useDeleteDimensaoMutation } from '../../hooks/mutations/useDimensaoMutations';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button as MuiButton,
    Chip
} from '@mui/material';
import { MdExpandMore } from 'react-icons/md';

const ConfirmModal = ({ show, onConfirm, onCancel, title, body, loading }) => (
    <Modal show={show} onHide={onCancel} centered size="sm">
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
            <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: 13, color: '#4a5568', padding: '16px 20px' }}>{body}</Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', gap: 8, padding: '12px 20px' }}>
            <Button variant="light" onClick={onCancel} disabled={loading} size="sm">Cancelar</Button>
            <Button variant="danger" onClick={onConfirm} disabled={loading} size="sm" style={{ minWidth: 90 }}>
                {loading ? <><Spinner size="sm" animation="border" className="me-1" />Processando...</> : 'Confirmar'}
            </Button>
        </Modal.Footer>
    </Modal>
);

const DimensionDataGrid = ({ eixoNumero, onEdit, onDelete, searchQuery }) => {
    const { data: dimensoes = [], isLoading } = useGetDimensoesByEixoQuery(eixoNumero);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return dimensoes.filter(d =>
            (d.nome || '').toLowerCase().includes(q) || String(d.numero).includes(q)
        );
    }, [dimensoes, searchQuery]);

    const columns = [
        {
            field: 'numero',
            headerName: 'Nº',
            width: 80,
            renderCell: (params) => (
                <Typography variant="caption" sx={{
                    fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #e2e8f0', fontWeight: 600
                }}>
                    {params.value}
                </Typography>
            )
        },
        { field: 'nome', headerName: 'Nome da Dimensão', flex: 1, minWidth: 200, renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography> },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 100,
            sortable: false,
            filterable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => onEdit(params.row)} sx={{ color: '#4a5568', '&:hover': { bgcolor: '#f1f5f9' } }}>
                            <FaRegEdit size={14} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton size="small" onClick={() => onDelete(params.row)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                            <IoTrashOutline size={15} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ width: '100%', height: 300, mt: 1 }}>
            <DataGrid
                rows={filtered}
                columns={columns}
                loading={isLoading}
                getRowId={(row) => row.numero}
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                density="compact"
                disableRowSelectionOnClick
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': { outline: 'none' },
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        '& .MuiDataGrid-columnHeaderTitle': { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }
                    }
                }}
            />
        </Box>
    );
};

const TableEixos = ({ searchQuery = '', onSuccess }) => {
    const { data: eixos = [], isLoading: loadingEixos, isError } = useGetEixosQuery();
    const deleteEixoMutation = useDeleteEixoMutation();
    const deleteDimensaoMutation = useDeleteDimensaoMutation();
    const showNotification = useNotification();

    const [selectedItem, setSelectedItem] = useState(null);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [showModalUpdateDimensao, setShowModalUpdateDimensao] = useState(false);
    const [showModalAddDimensao, setShowModalAddDimensao] = useState(false);
    const [currentEixoNumero, setCurrentEixoNumero] = useState(null);
    const [isEditingDimensao, setIsEditingDimensao] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({});

    useEffect(() => { if (isError) showNotification('Erro ao carregar eixos.', 'error'); }, [isError, showNotification]);

    const filteredEixos = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return eixos.filter(e => (e.nome || '').toLowerCase().includes(q) || String(e.numero).includes(q));
    }, [eixos, searchQuery]);

    const handleEdit = (item, isDimensao = false) => {
        setSelectedItem(item);
        setIsEditingDimensao(isDimensao);
        if (isDimensao) setShowModalUpdateDimensao(true);
        else setShowModalUpdate(true);
    };

    const handleDelete = (item, isDimensao = false) => {
        setConfirmConfig({
            title: isDimensao ? 'Excluir Dimensão' : 'Excluir Eixo',
            body: isDimensao
                ? `Excluir a dimensão "${item.nome}"? Esta ação não pode ser desfeita.`
                : `Excluir o eixo "${item.nome}" e todas as suas dimensões? Esta ação não pode ser desfeita.`,
            onConfirm: () => {
                if (isDimensao) {
                    deleteDimensaoMutation.mutate(item.numero, {
                        onSuccess: () => {
                            onSuccess?.('Dimensão excluída!');
                            setShowConfirm(false);
                        },
                        onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao excluir.', 'error')
                    });
                } else {
                    deleteEixoMutation.mutate(item.numero, {
                        onSuccess: () => {
                            onSuccess?.('Eixo excluído!');
                            setShowConfirm(false);
                        },
                        onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao excluir.', 'error')
                    });
                }
            },
        });
        setShowConfirm(true);
    };

    const handleUpdateSuccess = (msg) => {
        setShowModalUpdate(false);
        setShowModalUpdateDimensao(false);
        setShowModalAddDimensao(false);
        onSuccess?.(msg);
    };

    if (loadingEixos) return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3, 4].map(i => (
                <Box key={i} sx={{ height: 60, borderRadius: 2, bgcolor: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
            ))}
        </Box>
    );

    if (filteredEixos.length === 0) return (
        <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
            <Typography variant="h3" sx={{ mb: 1 }}>🔍</Typography>
            <Typography variant="body2">{searchQuery ? `Nenhum eixo para "${searchQuery}".` : 'Nenhum eixo cadastrado.'}</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 2 }}>
            {filteredEixos.map((eixo) => (
                <Accordion key={eixo.numero} sx={{
                    mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' },
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden'
                }}>
                    <AccordionSummary expandIcon={<MdExpandMore size={24} />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Chip
                                label={`Eixo ${eixo.numero}`}
                                size="small"
                                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', fontWeight: 700, fontSize: 10 }}
                            />
                            <Typography sx={{ fontWeight: 600, color: '#1a202c' }}>{eixo.nome}</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, px: 0, pb: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dimensões</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <MuiButton
                                    size="small" variant="outlined"
                                    onClick={() => { setCurrentEixoNumero(eixo.numero); setShowModalAddDimensao(true); }}
                                    sx={{ color: '#1D5E24', borderColor: '#1D5E24', '&:hover': { bgcolor: '#e8f5e9', borderColor: '#1D5E24' }, textTransform: 'none', fontWeight: 600 }}
                                >
                                    + Dimensão
                                </MuiButton>
                                <Tooltip title="Editar Eixo">
                                    <IconButton size="small" onClick={() => handleEdit(eixo)} sx={{ color: '#4a5568', '&:hover': { bgcolor: '#f1f5f9' } }}>
                                        <FaRegEdit size={16} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir Eixo">
                                    <IconButton size="small" onClick={() => handleDelete(eixo)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                                        <IoTrashOutline size={18} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        <DimensionDataGrid
                            eixoNumero={eixo.numero}
                            onEdit={(dim) => handleEdit(dim, true)}
                            onDelete={(dim) => handleDelete(dim, true)}
                            searchQuery={searchQuery}
                        />
                    </AccordionDetails>
                </Accordion>
            ))}

            {showModalUpdate && selectedItem && !isEditingDimensao && (
                <ModalUpdate show handleClose={() => setShowModalUpdate(false)} eixoData={selectedItem} onSuccess={handleUpdateSuccess} />
            )}
            {showModalUpdateDimensao && selectedItem && isEditingDimensao && (
                <ModalUpdateDimensao show handleClose={() => setShowModalUpdateDimensao(false)} dimensaoData={selectedItem} onSuccess={handleUpdateSuccess} />
            )}
            {showModalAddDimensao && currentEixoNumero && (
                <ModalAddDimensao show handleClose={() => setShowModalAddDimensao(false)} eixoNumero={currentEixoNumero} onSuccess={handleUpdateSuccess} />
            )}
            <ConfirmModal
                show={showConfirm}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setShowConfirm(false)}
                title={confirmConfig.title}
                body={confirmConfig.body}
                loading={deleteEixoMutation.isPending || deleteDimensaoMutation.isPending}
            />
        </Box>
    );
};

export default TableEixos;
