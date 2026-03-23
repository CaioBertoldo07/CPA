// src/components/Tables/Table_Avaliacao.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa6';
import { IoEyeOutline } from 'react-icons/io5';
import { BsUpload } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useGetAvaliacoesQuery } from '../../hooks/queries/useAvaliacaoQueries';
import {
    useDeleteAvaliacaoMutation,
    useEnviarAvaliacaoMutation,
    useProrrogarAvaliacaoMutation
} from '../../hooks/mutations/useAvaliacaoMutations';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales'
import { Box, IconButton, Tooltip, Typography, Chip } from '@mui/material';

const STATUS_MAP = {
    1: { label: 'Rascunho', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    2: { label: 'Enviada', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    3: { label: 'Encerrada', bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP[1];
    return (
        <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.8,
            px: 1.2, py: 0.4, borderRadius: 10,
            bgcolor: s.bg, color: s.color,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.4px',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot }} />
            {s.label}
        </Box>
    );
};

const fmt = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const Table_Avaliacao = ({ filtroStatus, searchQuery = '', onSuccess }) => {
    const { data: avaliacoes = [], isLoading: loading, isError } = useGetAvaliacoesQuery();
    const deleteMutation = useDeleteAvaliacaoMutation();
    const enviarMutation = useEnviarAvaliacaoMutation();
    const prorrogarMutation = useProrrogarAvaliacaoMutation();
    const showNotification = useNotification();

    const [showEnviar, setShowEnviar] = useState(false);
    const [showExcluir, setShowExcluir] = useState(false);
    const [showProrrogar, setShowProrrogar] = useState(false);
    const [avaliacaoAlvo, setAvaliacaoAlvo] = useState(null);
    const [novaDataFim, setNovaDataFim] = useState('');
    const navigate = useNavigate();

    useEffect(() => { if (isError) showNotification('Erro ao carregar avaliações.', 'error'); }, [isError, showNotification]);

    const handleEnviarConfirm = async () => {
        enviarMutation.mutate(avaliacaoAlvo.id, {
            onSuccess: () => {
                showNotification('Avaliação enviada com sucesso!', 'success');
                onSuccess?.('Avaliação enviada com sucesso!');
                setShowEnviar(false);
            },
            onError: (err) => showNotification(err.response?.data?.message || err.response?.data?.error || 'Erro ao enviar.', 'error')
        });
    };

    const handleExcluirConfirm = async () => {
        deleteMutation.mutate(avaliacaoAlvo.id, {
            onSuccess: () => {
                showNotification('Avaliação excluída com sucesso!', 'success');
                onSuccess?.('Avaliação excluída!');
                setShowExcluir(false);
            },
            onError: (err) => showNotification(err.response?.data?.message || err.response?.data?.error || 'Erro ao excluir.', 'error')
        });
    };

    const handleProrrogarConfirm = async () => {
        if (!novaDataFim) { showNotification('Informe a nova data.', 'warning'); return; }
        prorrogarMutation.mutate({ id: avaliacaoAlvo.id, novaDataFim }, {
            onSuccess: () => {
                showNotification('Avaliação prorrogada com sucesso!', 'success');
                onSuccess?.('Avaliação prorrogada!');
                setShowProrrogar(false);
            },
            onError: (err) => showNotification(err.response?.data?.message || err.response?.data?.error || 'Erro ao prorrogar.', 'error')
        });
    };

    const rows = useMemo(() => {
        return avaliacoes
            .filter(a => filtroStatus ? a.status === filtroStatus : true)
            .filter(a => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return String(a.id).includes(q)
                    || (a.periodo_letivo || '').toLowerCase().includes(q)
                    || (a.ano || '').toLowerCase().includes(q)
                    || (a.modalidades || []).some(m => (m.mod_ensino || '').toLowerCase().includes(q));
            });
    }, [avaliacoes, filtroStatus, searchQuery]);

    const columns = [
        {
            field: 'id',
            headerName: 'Código',
            width: 90,
            renderCell: (params) => (
                <Typography variant="caption" sx={{
                    fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #e2e8f0'
                }}>
                    #{params.value}
                </Typography>
            )
        },
        {
            field: 'modalidades',
            headerName: 'Modalidades',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {params.value?.map((m, i) => (
                        <Chip
                            key={i}
                            label={m.mod_ensino}
                            size="small"
                            variant="outlined"
                            sx={{ bgcolor: '#f1f5f9', color: '#4a5568', fontSize: '0.65rem', border: '1px solid #e2e8f0' }}
                        />
                    ))}
                </Box>
            )
        },
        { field: 'periodo_letivo', headerName: 'Período', width: 120, renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography> },
        { field: 'ano', headerName: 'Ano', width: 80 },
        { field: 'data_inicio', headerName: 'Início', width: 110, valueFormatter: (value) => fmt(value) },
        { field: 'data_fim', headerName: 'Fim', width: 110, valueFormatter: (value) => fmt(value) },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => <StatusBadge status={params.value} />
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 180,
            sortable: false,
            filterable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Ver relatório">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/relatorio/${params.row.id}`)}
                            sx={{ color: '#1D5E24', '&:hover': { bgcolor: '#e8f5e9' } }}
                        >
                            <IoEyeOutline size={18} />
                        </IconButton>
                    </Tooltip>

                    {params.row.status === 1 && (
                        <Tooltip title="Enviar">
                            <IconButton
                                size="small"
                                onClick={() => { setAvaliacaoAlvo(params.row); setShowEnviar(true); }}
                                sx={{ color: '#2563eb', '&:hover': { bgcolor: '#dbeafe' } }}
                            >
                                <BsUpload size={16} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {params.row.status === 2 && (
                        <Tooltip title="Prorrogar">
                            <IconButton
                                size="small"
                                onClick={() => { setAvaliacaoAlvo(params.row); setNovaDataFim(''); setShowProrrogar(true); }}
                                sx={{ color: '#7c3aed', '&:hover': { bgcolor: '#ede9fe' } }}
                            >
                                <BsUpload size={16} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {params.row.status === 1 && (
                        <Tooltip title="Excluir">
                            <IconButton
                                size="small"
                                onClick={() => { setAvaliacaoAlvo(params.row); setShowExcluir(true); }}
                                sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                            >
                                <FaTrash size={16} />
                            </IconButton>
                        </Tooltip>
                    )}
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

            <Modal show={showEnviar} onHide={() => setShowEnviar(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Enviar Avaliação</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ fontSize: 13 }}>
                    Deseja enviar a avaliação <strong>#{avaliacaoAlvo?.id}</strong> ({avaliacaoAlvo?.periodo_letivo})?
                    Após enviada, não poderá ser editada.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" size="sm" onClick={() => setShowEnviar(false)}>Cancelar</Button>
                    <Button variant="success" size="sm" onClick={handleEnviarConfirm} disabled={enviarMutation.isPending}>
                        {enviarMutation.isPending ? 'Enviando...' : 'Confirmar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showExcluir} onHide={() => setShowExcluir(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Excluir Avaliação</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ fontSize: 13 }}>
                    Tem certeza que deseja excluir a avaliação <strong>#{avaliacaoAlvo?.id}</strong>?
                    Esta ação não pode ser desfeita.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" size="sm" onClick={() => setShowExcluir(false)}>Cancelar</Button>
                    <Button variant="danger" size="sm" onClick={handleExcluirConfirm} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showProrrogar} onHide={() => setShowProrrogar(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Prorrogar Avaliação</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ fontSize: 13 }}>
                    <p>Avaliação: <strong>#{avaliacaoAlvo?.id}</strong> · Fim atual: <strong>{fmt(avaliacaoAlvo?.data_fim)}</strong></p>
                    <Form.Group>
                        <Form.Label style={{ fontSize: 12, fontWeight: 600 }}>Nova data</Form.Label>
                        <Form.Control type="date" value={novaDataFim} onChange={e => setNovaDataFim(e.target.value)} size="sm" />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" size="sm" onClick={() => setShowProrrogar(false)}>Cancelar</Button>
                    <Button style={{ background: '#1D5E24', border: 'none' }} size="sm" onClick={handleProrrogarConfirm} disabled={prorrogarMutation.isPending}>
                        {prorrogarMutation.isPending ? 'Salvando...' : 'Confirmar'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Box>
    );
};

export default Table_Avaliacao;
