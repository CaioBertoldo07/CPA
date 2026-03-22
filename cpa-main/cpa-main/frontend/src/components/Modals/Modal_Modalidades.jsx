import React, { useState, useEffect } from 'react';
import { TextField, Button, Alert, Box } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useAdicionarModalidadeMutation } from '../../hooks/mutations/useModalidadeMutations';

function Modal_Modalidades({ show, onHide, onSuccess }) {
    const [modEnsino, setModEnsino] = useState('');
    const [modOferta, setModOferta] = useState('');
    const [error, setError] = useState('');

    const mutation = useAdicionarModalidadeMutation();
    const loading = mutation.isPending;

    const resetForm = () => {
        setModEnsino('');
        setModOferta('');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    // Ensure state is reset when modal closes/opens
    useEffect(() => {
        if (!show) {
            resetForm();
        }
    }, [show]);

    const handleSave = () => {
        if (!modEnsino.trim()) {
            return setError('O campo "Modalidade de Ensino" é obrigatório.');
        }
        setError('');

        mutation.mutate({
            mod_ensino: modEnsino.trim(),
            mod_oferta: modOferta.trim()
        }, {
            onSuccess: () => {
                handleClose();
                if (onSuccess) onSuccess('Modalidade cadastrada com sucesso!');
            },
            onError: (err) => setError(err?.response?.data?.error || 'Erro ao cadastrar modalidade.')
        });
    };

    const modalActions = (
        <>
            <Button
                onClick={handleClose}
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
                {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={handleClose}
            title="Nova Modalidade"
            actions={modalActions}
            isLoading={loading}
            maxWidth="sm"
        >
            <Box component="form" noValidate sx={{ mt: 1 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="mod-ensino"
                    label="Modalidade de Ensino"
                    name="modEnsino"
                    autoFocus
                    value={modEnsino}
                    onChange={(e) => setModEnsino(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    placeholder="Ex: REGULAR"
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    margin="normal"
                    fullWidth
                    id="mod-oferta"
                    label="Modalidade de Oferta"
                    name="modOferta"
                    value={modOferta}
                    onChange={(e) => setModOferta(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    placeholder="Ex: PRESENCIAL"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2 }}
                />
            </Box>
        </MuiBaseModal>
    );
}

export default Modal_Modalidades;