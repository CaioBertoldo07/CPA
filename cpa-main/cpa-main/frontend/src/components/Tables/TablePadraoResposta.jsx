// src/components/Tables/TablePadraoResposta.jsx
import React, { useState, useEffect, useMemo } from 'react';
// import { Modal, Button, Spinner } from 'react-bootstrap';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import ModalUpdatePadraoResposta from '../Modals/ModalUpdatePadraoResposta';
import ModalAddAlternativa from '../Modals/ModalAddAlternativa';
import ModalUpdateAlternativa from '../Modals/ModalUpdateAlternativa';
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';
import { useGetPadraoRespostaQuery } from '../../hooks/queries/usePadraoRespostaQueries';
import { useDeletePadraoRespostaMutation } from '../../hooks/mutations/usePadraoRespostaMutations';
import { useGetAlternativasByPadraoRespostaIdQuery } from '../../hooks/queries/useAlternativaQueries';
import { useDeleteAlternativaMutation } from '../../hooks/mutations/useAlternativaMutations';
import { getAlternativasByPadraoRespostaId } from '../../api/alternativas';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales'
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Button as MuiButton
} from '@mui/material';
import { MdExpandMore } from 'react-icons/md';

const AlternativasDataGrid = ({ padraoId, onEdit, onDelete }) => {
    const showNotification = useNotification();
    const {
        data: dataAlternativas,
        isLoading,
        isError,
        error,
    } = useGetAlternativasByPadraoRespostaIdQuery(padraoId);

    console.debug('[AlternativasDataGrid] padraoId:', padraoId, '| isLoading:', isLoading, '| isError:', isError, '| rows:', dataAlternativas);

    useEffect(() => {
        if (isError) {
            console.error('[AlternativasDataGrid] Erro ao carregar alternativas para padraoId', padraoId, error);
            showNotification('Erro ao carregar alternativas.', 'error');
        }
    }, [isError, padraoId, error, showNotification]);

    const rows = Array.isArray(dataAlternativas) ? dataAlternativas : [];

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            renderCell: (params) => (
                <Typography variant="caption" sx={{
                    fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #e2e8f0', fontWeight: 600
                }}>
                    #{params.value}
                </Typography>
            )
        },
        { field: 'descricao', headerName: 'Alternativa', flex: 1, minWidth: 200, renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography> },
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

    if (isError) {
        return (
            <Box sx={{ p: 2, color: '#ef4444' }}>
                <Typography variant="body2">Não foi possível carregar as alternativas. Tente recarregar a página.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: 300, mt: 1 }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoading}
                getRowId={(row) => row.id}
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

const TablePadraoResposta = ({ searchQuery = '', onSuccess }) => {
    const { data: dataPadroes = [], isLoading: loadingTable, isError } = useGetPadraoRespostaQuery();
    const deletePadraoMutation = useDeletePadraoRespostaMutation();
    const deleteAlternativaMutation = useDeleteAlternativaMutation();
    const showNotification = useNotification();

    const [selectedItem, setSelectedItem] = useState(null);
    const [showModalUpdatePadrao, setShowModalUpdatePadrao] = useState(false);
    const [showModalAddAlternativa, setShowModalAddAlternativa] = useState(false);
    const [showModalUpdateAlternativa, setShowModalUpdateAlternativa] = useState(false);
    const [currentPadraoNumero, setCurrentPadraoNumero] = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmLabel, setConfirmLabel] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => { if (isError) showNotification('Erro ao carregar padrões.', 'error'); }, [isError, showNotification]);

    const filtered = useMemo(() => {
        return dataPadroes.filter(p => (p.sigla || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [dataPadroes, searchQuery]);

    const handleEditPadrao = (item) => {
        setSelectedItem(item);
        setShowModalUpdatePadrao(true);
    };

    const handleDeletePadrao = (item) => {
        setConfirmLabel(`padrão "${item.sigla}" e todas as suas alternativas`);
        setConfirmAction(() => async () => {
            try {
                const alts = await getAlternativasByPadraoRespostaId(item.id);
                for (const alt of (alts || [])) {
                    await deleteAlternativaMutation.mutateAsync(alt.id);
                }
                await deletePadraoMutation.mutateAsync(item.id);
                showNotification(`Padrão "${item.sigla}" excluído!`, 'success');
                setShowConfirm(false);
                onSuccess?.('Padrão excluído!');
            } catch (e) {
                showNotification('Erro ao excluir padrão.', 'error');
            }
        });
        setShowConfirm(true);
    };

    const handleEditAlternativa = (alt) => {
        setSelectedItem(alt);
        setShowModalUpdateAlternativa(true);
    };

    const handleDeleteAlternativa = (alt) => {
        setConfirmLabel(`alternativa "${alt.descricao}"`);
        setConfirmAction(() => () => {
            deleteAlternativaMutation.mutate(alt.id, {
                onSuccess: () => {
                    showNotification('Alternativa excluída!', 'success');
                    setShowConfirm(false);
                },
                onError: () => showNotification('Erro ao excluir alternativa.', 'error')
            });
        });
        setShowConfirm(true);
    };

    const handleUpdateSuccess = (message) => {
        setShowModalUpdatePadrao(false);
        setShowModalUpdateAlternativa(false);
        onSuccess?.(message);
    };

    if (loadingTable) return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3, 4].map(i => (
                <Box key={i} sx={{ height: 60, borderRadius: 2, bgcolor: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
            ))}
        </Box>
    );

    if (filtered.length === 0) return (
        <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
            <Typography variant="h3" sx={{ mb: 1 }}>📋</Typography>
            <Typography variant="body2">{searchQuery ? `Nenhum padrão para "${searchQuery}".` : 'Nenhum padrão cadastrado.'}</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 2 }}>
            {filtered.map((padrao) => (
                <Accordion key={padrao.id} sx={{
                    mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' },
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden'
                }}>
                    <AccordionSummary expandIcon={<MdExpandMore size={24} />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Chip
                                label={`#${padrao.id}`}
                                size="small"
                                sx={{ bgcolor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 700, fontSize: 10 }}
                            />
                            <Typography sx={{ fontWeight: 600, color: '#1a202c' }}>{padrao.sigla}</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, px: 0, pb: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Alternativas</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <MuiButton
                                    size="small" variant="outlined"
                                    onClick={() => { setCurrentPadraoNumero(padrao.id); setShowModalAddAlternativa(true); }}
                                    sx={{ color: '#1D5E24', borderColor: '#1D5E24', '&:hover': { bgcolor: '#e8f5e9', borderColor: '#1D5E24' }, textTransform: 'none', fontWeight: 600 }}
                                >
                                    + Alternativa
                                </MuiButton>
                                <Tooltip title="Editar Padrão">
                                    <IconButton size="small" onClick={() => handleEditPadrao(padrao)} sx={{ color: '#4a5568', '&:hover': { bgcolor: '#f1f5f9' } }}>
                                        <FaRegEdit size={16} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir Padrão">
                                    <IconButton size="small" onClick={() => handleDeletePadrao(padrao)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                                        <IoTrashOutline size={18} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        <AlternativasDataGrid
                            padraoId={padrao.id}
                            onEdit={handleEditAlternativa}
                            onDelete={handleDeleteAlternativa}
                        />
                    </AccordionDetails>
                </Accordion>
            ))}

            {showModalUpdatePadrao && selectedItem && (
                <ModalUpdatePadraoResposta show handleClose={() => setShowModalUpdatePadrao(false)} padraoData={selectedItem} onSuccess={handleUpdateSuccess} />
            )}
            {showModalAddAlternativa && currentPadraoNumero !== null && (
                <ModalAddAlternativa show handleClose={() => setShowModalAddAlternativa(false)} paraoNumero={currentPadraoNumero} onSuccess={handleUpdateSuccess} />
            )}
            {showModalUpdateAlternativa && selectedItem && (
                <ModalUpdateAlternativa show handleClose={() => setShowModalUpdateAlternativa(false)} paraoNumero={currentPadraoNumero} onSuccess={handleUpdateSuccess} alternativa={selectedItem} />
            )}
            <ConfirmDeleteModal show={showConfirm} onConfirm={confirmAction} onCancel={() => setShowConfirm(false)} message={`Deseja excluir ${confirmLabel}?`} loading={deletePadraoMutation.isPending || deleteAlternativaMutation.isPending} />
        </Box>
    );
};

export default TablePadraoResposta;
