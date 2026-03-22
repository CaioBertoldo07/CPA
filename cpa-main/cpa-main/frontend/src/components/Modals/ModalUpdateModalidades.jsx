import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert, Typography } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useEditModalidadeMutation } from '../../hooks/mutations/useModalidadeMutations';

function ModalUpdateModalidades({ show, modalidade, onClose, onSave }) {
    const [modEnsino, setModEnsino] = useState('');
    const [modOferta, setModOferta] = useState('');
    const [error, setError] = useState('');

    const mutation = useEditModalidadeMutation();
    const loading = mutation.isPending;

    useEffect(() => {
        if (modalidade && show) {
            setModEnsino(modalidade.mod_ensino || '');
            setModOferta(modalidade.mod_oferta || '');
            setError('');
        }
    }, [modalidade, show]);

    const handleSave = () => {
        if (!modEnsino.trim()) {
            return setError('O nome do ensino é obrigatório.');
        }

        mutation.mutate({
            id: modalidade.id,
            data: { mod_ensino: modEnsino.trim(), mod_oferta: modOferta.trim() }
        }, {
            onSuccess: (data) => {
                onSave?.(data?.message || 'Modalidade atualizada com sucesso!');
                onClose();
            },
            onError: (err) => {
                setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao atualizar modalidade.');
            }
        });
    };

    const modalActions = (
        <>
            <Button
                onClick={onClose}
                color="inherit"
                disabled={loading}
                sx={{ fontWeight: 600 }}
            >
                Cancelar
            </Button>
            <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                    fontWeight: 700,
                    minWidth: '100px'
                }}
            >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={onClose}
            title="Editar Modalidade"
            actions={modalActions}
            isLoading={loading}
            maxWidth="xs"
        >
            <Box sx={{ mt: 1 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Nome do Ensino"
                        variant="outlined"
                        value={modEnsino}
                        onChange={(e) => setModEnsino(e.target.value)}
                        disabled={loading}
                        placeholder="Ex: REGULAR"
                        autoFocus
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        fullWidth
                        label="Oferta"
                        variant="outlined"
                        value={modOferta}
                        onChange={(e) => setModOferta(e.target.value)}
                        disabled={loading}
                        placeholder="Ex: PRESENCIAL"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </Box>
        </MuiBaseModal>
    );
}

export default ModalUpdateModalidades;
