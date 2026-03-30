import React, { useState, useEffect, useMemo } from 'react';
import {
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Paper,
    InputAdornment,
    Typography,
    Box,
    Alert,
    Button,
    CircularProgress
} from '@mui/material';
import { IoSearchOutline } from 'react-icons/io5';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useGetCursosByUnidadesQuery } from '../../hooks/queries/useCursoQueries';

function CursoSelectionModal({ show, onHide, onCursosSelected, unidadesSelecionadas, modalidadesSelecionadas = [], initialSelectedCursos = [] }) {
    const [selectedCursos, setSelectedCursos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const unidadesIds = unidadesSelecionadas?.map(u => u.value) || [];
    const modalidadesIds = (modalidadesSelecionadas?.map(m => Number(m.value)) || [])
        .filter(id => Number.isFinite(id));
    const {
        data: response = [],
        isLoading: loading,
        isError,
        error: queryError
    } = useGetCursosByUnidadesQuery(unidadesIds, modalidadesIds);

    // Normaliza a resposta
    const cursos = useMemo(() => {
        let raw = [];
        if (Array.isArray(response)) {
            raw = response;
        } else if (response && Array.isArray(response.data)) {
            raw = response.data;
        } else if (response && Array.isArray(response.cursos)) {
            raw = response.cursos;
        } else if (response && typeof response === 'object') {
            const firstArray = Object.values(response).find(v => Array.isArray(v));
            if (firstArray) raw = firstArray;
        }
        return raw;
    }, [response]);

    const filteredCursos = useMemo(() => {
        if (!searchTerm.trim()) return cursos;
        const lowerSearch = searchTerm.toLowerCase();
        return cursos.filter(c =>
            (c.nome?.toLowerCase().includes(lowerSearch)) ||
            (c.identificador_api_lyceum?.toString().toLowerCase().includes(lowerSearch)) ||
            (c.modalidade?.toLowerCase().includes(lowerSearch))
        );
    }, [cursos, searchTerm]);

    const error = isError ? (queryError?.response?.data?.error || queryError?.message || 'Erro ao carregar cursos.') : '';

    useEffect(() => {
        if (show) {
            // Seed with previously confirmed courses, deduplicating by stable key
            const seen = new Set();
            const seeded = initialSelectedCursos.filter(c => {
                const key = c.identificador_api_lyceum ?? c.id;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            setSelectedCursos(seeded);
        } else {
            setSearchTerm('');
        }
    }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectCurso = (curso) => {
        const key = curso.identificador_api_lyceum ?? curso.id;
        const isSelected = selectedCursos.some(
            c => (c.identificador_api_lyceum ?? c.id) === key
        );
        if (isSelected) {
            setSelectedCursos(prev => prev.filter(c => (c.identificador_api_lyceum ?? c.id) !== key));
        } else {
            setSelectedCursos(prev => [...prev, curso]);
        }
    };

    const handleSelectAll = () => {
        if (isAllFilteredSelected) {
            // Deselect only the items currently visible in the filtered list
            const filteredKeys = new Set(filteredCursos.map(c => c.identificador_api_lyceum ?? c.id));
            setSelectedCursos(prev => prev.filter(c => !filteredKeys.has(c.identificador_api_lyceum ?? c.id)));
        } else {
            // Add missing filtered items (keep pre-seeded items from other pages/batches)
            const existingKeys = new Set(selectedCursos.map(c => c.identificador_api_lyceum ?? c.id));
            const toAdd = filteredCursos.filter(c => !existingKeys.has(c.identificador_api_lyceum ?? c.id));
            setSelectedCursos(prev => [...prev, ...toAdd]);
        }
    };

    const handleConfirmSelection = () => {
        onCursosSelected(selectedCursos);
        onHide();
    };

    const isAllFilteredSelected = filteredCursos.length > 0 &&
        filteredCursos.every(c =>
            selectedCursos.some(s => (s.identificador_api_lyceum ?? s.id) === (c.identificador_api_lyceum ?? c.id))
        );
    const isSomeFilteredSelected = filteredCursos.some(c =>
        selectedCursos.some(s => (s.identificador_api_lyceum ?? s.id) === (c.identificador_api_lyceum ?? c.id))
    );

    const modalActions = (
        <>
            <Button onClick={onHide} color="inherit" sx={{ fontWeight: 600 }}>
                Cancelar
            </Button>
            <Button
                onClick={handleConfirmSelection}
                variant="contained"
                color="primary"
                disabled={selectedCursos.length === 0}
                sx={{ fontWeight: 700, minWidth: '150px' }}
            >
                Confirmar Seleção ({selectedCursos.length})
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={onHide}
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎓 Selecionar Cursos
                    {selectedCursos.length > 0 && (
                        <Typography
                            variant="caption"
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 700
                            }}
                        >
                            {selectedCursos.length} selecionado(s)
                        </Typography>
                    )}
                </Box>
            }
            actions={modalActions}
            maxWidth="md"
        >
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar curso por nome, código ou modalidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={unidadesIds.length === 0 || modalidadesIds.length === 0}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IoSearchOutline />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ backgroundColor: 'white' }}
                />
            </Box>

            <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <CircularProgress size={30} sx={{ mb: 2 }} />
                        <Typography color="text.secondary">Carregando cursos disponíveis...</Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : filteredCursos.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" sx={{ bgcolor: 'grey.50' }}>
                                        <Checkbox
                                            indeterminate={isSomeFilteredSelected && !isAllFilteredSelected}
                                            checked={isAllFilteredSelected}
                                            onChange={handleSelectAll}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>Código</TableCell>
                                    <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>Curso</TableCell>
                                    <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>Modalidade</TableCell>
                                    <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>Tipo Curso</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCursos.map((curso) => {
                                    const key = curso.identificador_api_lyceum ?? curso.id;
                                    const isSelected = selectedCursos.some(
                                        c => (c.identificador_api_lyceum ?? c.id) === key
                                    );
                                    return (
                                        <TableRow
                                            key={key}
                                            hover
                                            onClick={() => handleSelectCurso(curso)}
                                            selected={isSelected}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected} size="small" />
                                            </TableCell>
                                            <TableCell>{curso.identificador_api_lyceum ?? curso.id ?? '—'}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{curso.nome ?? curso.name ?? '—'}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ px: 1, py: 0.25, bgcolor: 'grey.200', borderRadius: 1 }}>
                                                    {curso.modalidade_rel?.mod_ensino ?? curso.modalidade ?? '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ px: 1, py: 0.25, bgcolor: 'grey.200', borderRadius: 1 }}>
                                                    {curso.curso_tipo ?? '—'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Alert severity="info">
                        {unidadesIds.length === 0
                            ? 'Selecione ao menos uma unidade para buscar cursos.'
                            : modalidadesIds.length === 0
                                ? 'Selecione ao menos uma modalidade para buscar cursos.'
                                : searchTerm
                                    ? 'Nenhum curso corresponde à sua busca.'
                                    : 'Nenhum curso encontrado para os filtros selecionados.'}
                    </Alert>
                )}
            </Box>
        </MuiBaseModal>
    );
}

export default CursoSelectionModal;