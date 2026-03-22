import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useAdicionarDimensaoMutation } from '../../hooks/mutations/useDimensaoMutations';

const ModalAddDimensao = ({ show, handleClose, eixoNumero, onSuccess }) => {
    const [numero, setNumero] = useState('');
    const [nome, setNome] = useState('');
    const [error, setError] = useState('');

    const adicionarDimensaoMutation = useAdicionarDimensaoMutation();
    const loading = adicionarDimensaoMutation.isPending;

    const resetForm = () => {
        setNumero('');
        setNome('');
        setError('');
    };

    useEffect(() => {
        if (!show) {
            resetForm();
        }
    }, [show]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!numero.trim() || !nome.trim()) {
            return setError('Todos os campos são obrigatórios.');
        }
        setError('');

        const newDimensao = { numero: numero.trim(), nome: nome.trim(), numero_eixos: eixoNumero };
        adicionarDimensaoMutation.mutate(newDimensao, {
            onSuccess: () => {
                if (onSuccess) onSuccess('Dimensão adicionada com sucesso');
                handleClose();
            },
            onError: (err) => {
                setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao adicionar dimensão.');
            }
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
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                    fontWeight: 700,
                    minWidth: '100px'
                }}
            >
                {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={handleClose}
            title={`Adicionar Dimensão ao Eixo ${eixoNumero}`}
            actions={modalActions}
            isLoading={loading}
            maxWidth="sm"
        >
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="num-dimensao"
                    label="Número da Dimensão"
                    name="numero"
                    autoFocus
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    placeholder="Ex: 1.1"
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="nome-dimensao"
                    label="Nome da Dimensão"
                    name="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    placeholder="Ex: Planejamento Estratégico"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2 }}
                />
            </Box>
        </MuiBaseModal>
    );
};

export default ModalAddDimensao;
