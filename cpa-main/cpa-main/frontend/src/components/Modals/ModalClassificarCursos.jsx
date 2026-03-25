import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Chip,
    Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useClassificarCursosMutation } from '../../hooks/mutations/useCursoMutations';

const dataGridSx = {
    border: '1px solid #e2e8f0',
    borderRadius: 2,
    '& .MuiDataGrid-cell:focus': { outline: 'none' },
    '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
    '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
    '& .MuiDataGrid-columnHeaders': {
        bgcolor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: 11,
            fontWeight: 600,
            color: '#718096',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
    },
};

const columns = [
    {
        field: 'identificador_api_lyceum',
        headerName: 'Código',
        width: 130,
        renderCell: (params) => (
            <Typography variant="caption" sx={{
                fontFamily: 'monospace', bgcolor: '#f1f5f9',
                px: 1, py: 0.25, borderRadius: 1,
                border: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b',
            }}>
                {params.value ?? '—'}
            </Typography>
        ),
    },
    {
        field: 'nome',
        headerName: 'Nome do Curso',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography>
        ),
    },
    {
        field: 'municipio',
        headerName: 'Município',
        width: 160,
        valueGetter: (value) => value?.nome ?? '—',
    },
];

function ModalClassificarCursos({ show, onHide, cursos = [], onSuccess }) {
    const [idModalidade, setIdModalidade] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const { data: modalidadesRaw } = useGetModalidadesQuery();
    const modalidades = useMemo(() => {
        if (Array.isArray(modalidadesRaw)) return modalidadesRaw;
        if (modalidadesRaw?.data) return modalidadesRaw.data;
        return [];
    }, [modalidadesRaw]);

    const classificarMutation = useClassificarCursosMutation();

    // Inicializa select e reseta seleção ao abrir/fechar
    useEffect(() => {
        if (!show) {
            setSelectedIds([]);
            setIdModalidade('');
        }
    }, [show]);

    useEffect(() => {
        if (modalidades.length > 0 && !idModalidade) {
            setIdModalidade(String(modalidades[0].id));
        }
    }, [modalidades, idModalidade]);

    const selectedCount = selectedIds.length;

    const handleSalvar = () => {
        if (!selectedCount || !idModalidade) return;
        classificarMutation.mutate(
            { cursoIds: selectedIds, idModalidade: Number(idModalidade) },
            {
                onSuccess: () => {
                    const nomeMod = modalidades.find(m => String(m.id) === idModalidade)?.nome ?? '';
                    onSuccess?.(`${selectedCount} curso(s) classificado(s) como "${nomeMod}" com sucesso!`);
                    onHide();
                },
            }
        );
    };

    const modalActions = (
        <>
            <Button
                onClick={onHide}
                color="inherit"
                disabled={classificarMutation.isPending}
                sx={{ fontWeight: 600 }}
            >
                Cancelar
            </Button>
            <Button
                onClick={handleSalvar}
                variant="contained"
                color="primary"
                disabled={selectedCount === 0 || !idModalidade || classificarMutation.isPending}
                sx={{ fontWeight: 700, minWidth: 160 }}
            >
                {classificarMutation.isPending
                    ? 'Salvando...'
                    : `Classificar (${selectedCount})`}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={onHide}
            title="Classificar Cursos"
            actions={modalActions}
            isLoading={classificarMutation.isPending}
            maxWidth="md"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {cursos.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Todos os cursos desta página já possuem modalidade classificada.
                    </Alert>
                ) : (
                    <>
                        <FormControl fullWidth size="small">
                            <InputLabel>Modalidade</InputLabel>
                            <Select
                                value={idModalidade}
                                label="Modalidade"
                                onChange={e => setIdModalidade(e.target.value)}
                            >
                                {modalidades.map(m => (
                                    <MenuItem key={m.id} value={String(m.id)}>
                                        {m.nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ height: 360 }}>
                            <DataGrid
                                rows={cursos}
                                columns={columns}
                                checkboxSelection
                                disableRowSelectionOnClick
                                density="compact"
                                pageSizeOptions={[10, 25]}
                                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                                onRowSelectionModelChange={(model) => {
                                    const ids = Array.isArray(model)
                                        ? model
                                        : (model?.ids ? Array.from(model.ids) : []);
                                    setSelectedIds(ids);
                                }}
                                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                                sx={dataGridSx}
                            />
                        </Box>
                    </>
                )}
            </Box>
        </MuiBaseModal>
    );
}

export default ModalClassificarCursos;
