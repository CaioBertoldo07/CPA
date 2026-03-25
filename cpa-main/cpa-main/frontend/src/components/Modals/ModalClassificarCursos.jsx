import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Checkbox,
    CircularProgress,
} from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useClassifyCursosMutation } from '../../hooks/mutations/useCursoMutations';

function ModalClassificarCursos({ show, onHide, cursoIds = [], onSuccess }) {
    const [selectedModalidadeId, setSelectedModalidadeId] = useState(null);

    const { data: modalidades = [], isLoading: loadingModalidades } = useGetModalidadesQuery();

    const classificarMutation = useClassifyCursosMutation();

    useEffect(() => {
        if (!show) setSelectedModalidadeId(null);
    }, [show]);

    const handleSalvar = () => {
        if (!cursoIds.length || !selectedModalidadeId) return;
        classificarMutation.mutate(
            { cursoIds, idModalidade: selectedModalidadeId },
            {
                onSuccess: () => {
                    const nomeMod = modalidades.find(m => m.id === selectedModalidadeId)?.nome ?? '';
                    onSuccess?.(`${cursoIds.length} curso(s) classificado(s) como "${nomeMod}" com sucesso!`);
                    onHide();
                },
            }
        );
    };

    const modalActions = (
        <>
            <Button onClick={onHide} color="inherit" disabled={classificarMutation.isPending} sx={{ fontWeight: 600 }}>
                Cancelar
            </Button>
            <Button
                onClick={handleSalvar}
                variant="contained"
                color="primary"
                disabled={!selectedModalidadeId || classificarMutation.isPending}
                sx={{ fontWeight: 700, minWidth: 160 }}
            >
                {classificarMutation.isPending ? 'Salvando...' : `Classificar (${cursoIds.length})`}
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
            maxWidth="sm"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {cursoIds.length} curso(s) selecionado(s) serão classificados com a modalidade escolhida abaixo.
                </Typography>

                {loadingModalidades ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : modalidades.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Nenhuma modalidade cadastrada.
                    </Alert>
                ) : (
                    <List sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 0, overflow: 'hidden' }}>
                        {modalidades.map((m, index) => (
                            <ListItem key={m.id} disablePadding divider={index < modalidades.length - 1}>
                                <ListItemButton
                                    onClick={() => setSelectedModalidadeId(m.id)}
                                    selected={selectedModalidadeId === m.id}
                                    sx={{ '&.Mui-selected': { bgcolor: '#eff6ff' }, '&.Mui-selected:hover': { bgcolor: '#dbeafe' } }}
                                >
                                    <Checkbox
                                        checked={selectedModalidadeId === m.id}
                                        disableRipple
                                        size="small"
                                        sx={{ mr: 1, p: 0 }}
                                    />
                                    <ListItemText
                                        primary={m.mod_ensino}
                                        primaryTypographyProps={{ fontWeight: selectedModalidadeId === m.id ? 600 : 400 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </MuiBaseModal>
    );
}

export default ModalClassificarCursos;
