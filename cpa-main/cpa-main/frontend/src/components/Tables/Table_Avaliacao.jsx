import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaTrash, FaPencil } from 'react-icons/fa6';
import { IoEyeOutline, IoSearchOutline } from 'react-icons/io5';
import { BsUpload } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useGetAvaliacoesQuery } from '../../hooks/queries/useAvaliacaoQueries';
import {
    useDeleteAvaliacaoMutation,
    useEnviarAvaliacaoMutation,
    useProrrogarAvaliacaoMutation
} from '../../hooks/mutations/useAvaliacaoMutations';
import { DataGrid, getGridStringOperators } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, IconButton, Tooltip, Typography, Chip, Button as MuiButton, Autocomplete, TextField } from '@mui/material';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';

const STATUS_MAP = {
    1: { label: 'Rascunho', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    2: { label: 'Enviada', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    3: { label: 'Encerrada', bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP[1];
    return (
        <Chip
            label={s.label}
            size="small"
            sx={{
                bgcolor: s.bg,
                color: s.color,
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 24,
                '& .MuiChip-label': { px: 1 },
                border: `1px solid ${s.dot}44`
            }}
            icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot, ml: '8px !important' }} />}
        />
    );
};

const MultiSelectModalidadesInput = ({ item, applyValue, apiRef }) => {
    const column = apiRef.current.getColumn(item.field);
    const options = column.valueOptions || [];
    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            value={item.value || []}
            onChange={(_, newValue) => applyValue({ ...item, value: newValue })}
            renderInput={(params) => (
                <TextField {...params} label="Modalidades" variant="standard" size="small" />
            )}
            sx={{ minWidth: 220 }}
        />
    );
};

const supportedStringFilterOperators = getGridStringOperators().filter(op =>
    ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'].includes(op.value)
);

const modalidadesFilterOperators = [
    {
        label: 'contém algum de',
        value: 'isAnyOf',
        getApplyFilterFn: (filterItem) => {
            if (!filterItem.value?.length) return null;
            return (value) => filterItem.value.some(v => value?.includes(v));
        },
        InputComponent: MultiSelectModalidadesInput,
    },
    ...supportedStringFilterOperators,
];

const fmt = d => {
    if (!d) return '—';
    const datePart = String(d).substring(0, 10);
    return new Date(datePart + 'T00:00:00').toLocaleDateString('pt-BR');
};

const Table_Avaliacao = ({ filtroStatus, searchQuery = '', onSuccess, onVerDetalhes, onEditar }) => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [debouncedFilters, setDebouncedFilters] = useState([]);

    // Debounce dos filtros de coluna para não disparar request a cada tecla
    useEffect(() => {
        const t = setTimeout(() => setDebouncedFilters(filterModel.items), 400);
        return () => clearTimeout(t);
    }, [filterModel]);

    // Reseta para página 0 quando qualquer filtro muda
    useEffect(() => {
        setPaginationModel(prev => prev.page === 0 ? prev : { ...prev, page: 0 });
    }, [filtroStatus, searchQuery, debouncedFilters]);

    const { data: response, isLoading: loading, isError } = useGetAvaliacoesQuery({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        status: filtroStatus ?? undefined,
        search: searchQuery || undefined,
        columnFilters: debouncedFilters.length ? debouncedFilters : undefined,
    });

    const avaliacoes = response?.data ?? [];
    const rowCount = response?.meta?.total ?? 0;

    const { data: modalidadesData = [] } = useGetModalidadesQuery();
    const modalidadesOptions = modalidadesData.map(m => m.mod_ensino);

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
        prorrogarMutation.mutate({ id: avaliacaoAlvo.id, novaDataFim: `${novaDataFim}T23:59:59` }, {
            onSuccess: () => {
                showNotification('Avaliação prorrogada com sucesso!', 'success');
                onSuccess?.('Avaliação prorrogada!');
                setShowProrrogar(false);
            },
            onError: (err) => showNotification(err.response?.data?.message || err.response?.data?.error || 'Erro ao prorrogar.', 'error')
        });
    };

    const rows = avaliacoes;

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
            type: 'string',
            flex: 1,
            minWidth: 200,
            valueOptions: modalidadesOptions,
            filterOperators: modalidadesFilterOperators,
            valueGetter: (value) => (value || []).map(m => m.mod_ensino).join(', '),
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(params.row.modalidades || []).map((m, i) => (
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
        { field: 'periodo_letivo', headerName: 'Período', type: 'string', width: 120, filterOperators: supportedStringFilterOperators, renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography> },
        { field: 'ano', headerName: 'Ano', type: 'string', width: 80, filterOperators: supportedStringFilterOperators },
        {
            field: 'data_inicio',
            headerName: 'Início',
            type: 'date',
            width: 110,
            valueGetter: (value) => {
                if (!value) return null;
                return new Date(String(value).substring(0, 10) + 'T00:00:00');
            },
            valueFormatter: (value) => value ? value.toLocaleDateString('pt-BR') : '—',
        },
        {
            field: 'data_fim',
            headerName: 'Fim',
            type: 'date',
            width: 110,
            valueGetter: (value) => {
                if (!value) return null;
                return new Date(String(value).substring(0, 10) + 'T00:00:00');
            },
            valueFormatter: (value) => value ? value.toLocaleDateString('pt-BR') : '—',
        },
        {
            field: 'status',
            headerName: 'Status',
            type: 'singleSelect',
            width: 130,
            valueOptions: [
                { value: 1, label: 'Rascunho' },
                { value: 2, label: 'Enviada' },
                { value: 3, label: 'Encerrada' },
            ],
            renderCell: (params) => <StatusBadge status={params.value} />
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 500,
            sortable: false,
            filterable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '100px 80px 80px 110px 80px',
                    gap: 1,
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    width: '100%',
                    pr: 1
                }}>
                    {/* Ver Detalhes */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Tooltip title="Ver detalhes">
                            <MuiButton
                                size="small"
                                variant="text"
                                startIcon={<IoSearchOutline size={15} />}
                                onClick={() => onVerDetalhes?.(params.row.id)}
                                sx={{
                                    color: '#7c3aed',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    minWidth: 'auto',
                                    '&:hover': { bgcolor: '#ede9fe' }
                                }}
                            >
                                Detalhes
                            </MuiButton>
                        </Tooltip>
                    </Box>

                    {/* Ver relatório */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Tooltip title="Ver relatório">
                            <MuiButton
                                size="small"
                                variant="text"
                                startIcon={<IoEyeOutline size={16} />}
                                onClick={() => navigate(`/relatorio/${params.row.id}`)}
                                sx={{
                                    color: '#1D5E24',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    minWidth: 'auto',
                                    '&:hover': { bgcolor: '#e8f5e9' }
                                }}
                            >
                                Ver 
                            </MuiButton>
                        </Tooltip>
                    </Box>

                    {/* Editar (apenas rascunho) */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        {params.row.status === 1 && (() => {
                            const vencida = new Date(params.row.data_fim.substring(0, 10) + 'T23:59:59') < new Date();
                            return (
                                <Tooltip title={vencida ? 'Data de fim vencida — edite a data para poder enviar' : 'Editar rascunho'}>
                                    <MuiButton
                                        size="small"
                                        variant="text"
                                        startIcon={<FaPencil size={13} />}
                                        onClick={() => onEditar?.(params.row.id)}
                                        sx={{
                                            color: vencida ? '#dc2626' : '#d97706',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            minWidth: 'auto',
                                            '&:hover': { bgcolor: vencida ? '#fee2e2' : '#fef3c7' }
                                        }}
                                    >
                                        Editar
                                    </MuiButton>
                                </Tooltip>
                            );
                        })()}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        {params.row.status === 1 && new Date(params.row.data_fim.substring(0, 10) + 'T23:59:59') >= new Date() && (
                            <Tooltip title="Enviar">
                                <MuiButton
                                    size="small"
                                    variant="text"
                                    startIcon={<BsUpload size={14} />}
                                    onClick={() => { setAvaliacaoAlvo(params.row); setShowEnviar(true); }}
                                    sx={{
                                        color: '#2563eb',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        '&:hover': { bgcolor: '#dbeafe' }
                                    }}
                                >
                                    Enviar
                                </MuiButton>
                            </Tooltip>
                        )}

                        {params.row.status === 2 && (
                            <Tooltip title="Prorrogar">
                                <MuiButton
                                    size="small"
                                    variant="text"
                                    startIcon={<BsUpload size={14} />}
                                    onClick={() => { setAvaliacaoAlvo(params.row); setNovaDataFim(''); setShowProrrogar(true); }}
                                    sx={{
                                        color: '#7c3aed',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        '&:hover': { bgcolor: '#ede9fe' }
                                    }}
                                >
                                    Prorrogar
                                </MuiButton>
                            </Tooltip>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        {params.row.status === 1 && (
                            <Tooltip title="Excluir">
                                <MuiButton
                                    size="small"
                                    variant="text"
                                    color="error"
                                    startIcon={<FaTrash size={14} />}
                                    onClick={() => { setAvaliacaoAlvo(params.row); setShowExcluir(true); }}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        '&:hover': { bgcolor: '#fee2e2' }
                                    }}
                                >
                                    Excluir
                                </MuiButton>
                            </Tooltip>
                        )}
                    </Box>
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
                paginationMode="server"
                rowCount={rowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                filterMode="server"
                filterModel={filterModel}
                onFilterModelChange={(model) => setFilterModel(model)}
                pageSizeOptions={[10, 25, 50]}
                density="compact"
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
