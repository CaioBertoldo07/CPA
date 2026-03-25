import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Paper,
    TablePagination,
    TextField,
    InputAdornment,
} from '@mui/material';
import { IoSearchOutline } from 'react-icons/io5';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useGetPaginatedCursosQuery } from '../../hooks/queries/useCursoQueries';
import { useClassifyCursosMutation } from '../../hooks/mutations/useCursoMutations';
import { useNotification } from '../../context/NotificationContext';

const Modal_IncluirCursos = ({ show, onHide, modalityId, modalityName }) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const showNotification = useNotification();
    const classifyMutation = useClassifyCursosMutation();

    // Debounce search term to avoid excessive API calls
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: response, isLoading, isError, error } = useGetPaginatedCursosQuery({
        page: page + 1,
        pageSize: pageSize,
        unclassified: 'true',
        nome: debouncedSearch
    });

    const rows = response?.items || [];
    const totalCount = response?.totalCount || 0;

    useEffect(() => {
        if (!show) {
            setSelectedIds([]);
            setPage(0);
            setSearchTerm('');
        }
    }, [show]);

    const handleSelectRow = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map(r => r.id);
            setSelectedIds(prev => [...new Set([...prev, ...newSelected])]);
        } else {
            const rowIds = rows.map(r => r.id);
            setSelectedIds(prev => prev.filter(id => !rowIds.includes(id)));
        }
    };

    const handleInclude = () => {
        if (selectedIds.length === 0) return;

        classifyMutation.mutate({
            cursoIds: selectedIds,
            idModalidade: modalityId
        }, {
            onSuccess: () => {
                showNotification(`${selectedIds.length} cursos incluídos com sucesso!`, 'success');
                setSelectedIds([]);
                onHide();
            },
            onError: (err) => {
                showNotification(err?.response?.data?.message || 'Erro ao incluir cursos.', 'error');
            }
        });
    };

    const modalActions = (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onHide} color="inherit">Cancelar</Button>
            <Button 
                onClick={handleInclude} 
                variant="contained" 
                color="primary"
                disabled={selectedIds.length === 0 || classifyMutation.isPending}
                startIcon={classifyMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
            >
                Incluir Selecionados ({selectedIds.length})
            </Button>
        </Box>
    );

    const isAllSelected = rows.length > 0 && rows.every(r => selectedIds.includes(r.id));
    const isSomeSelected = rows.some(r => selectedIds.includes(r.id)) && !isAllSelected;

    return (
        <MuiBaseModal
            open={show}
            onClose={onHide}
            title={`Incluir Cursos em: ${modalityName}`}
            actions={modalActions}
            maxWidth="lg"
        >
            <Box sx={{ minHeight: 400, width: '100%', position: 'relative' }}>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar por nome ou código..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0); // Volta para primeira página ao buscar
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IoSearchOutline color="#94a3b8" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ bgcolor: '#f8fafc' }}
                    />
                </Box>

                {isError && <Alert severity="error" sx={{ mb: 2 }}>{error?.message || 'Erro ao carregar cursos.'}</Alert>}
                
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 450, overflowY: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={isSomeSelected}
                                                checked={isAllSelected}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Nome do Curso</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Unidade / Município</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow 
                                            key={row.id} 
                                            hover 
                                            selected={selectedIds.includes(row.id)}
                                            onClick={() => handleSelectRow(row.id)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={selectedIds.includes(row.id)} />
                                            </TableCell>
                                            <TableCell>{row.identificador_api_lyceum || row.id}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{row.nome}</TableCell>
                                            <TableCell>{row.curso_tipo || '—'}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">
                                                    {row.unidades?.nome || '—'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {row.municipio?.nome || '—'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {rows.length === 0 && !isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                Nenhum curso disponível para classificação.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={pageSize}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setPageSize(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            labelRowsPerPage="Itens por página:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                        />
                    </>
                )}
            </Box>
        </MuiBaseModal>
    );
};

export default Modal_IncluirCursos;
