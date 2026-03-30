import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useEditDimensaoMutation } from '../../hooks/mutations/useDimensaoMutations';

const ModalUpdateDimensao = ({ show, handleClose, dimensaoData, onSuccess }) => {
    const [novoNumero, setNovoNumero] = useState('');
    const [nome, setNome] = useState('');
    const [error, setError] = useState('');

    const editDimensaoMutation = useEditDimensaoMutation();
    const loading = editDimensaoMutation.isPending;

    useEffect(() => {
        if (dimensaoData) {
            setNovoNumero(String(dimensaoData.numero ?? ''));
            setNome(dimensaoData.nome || '');
            setError('');
        }
    }, [dimensaoData]);

    const handleUpdate = async () => {
        const numeroAtual = Number(dimensaoData?.numero);
        if (Number.isNaN(numeroAtual) || numeroAtual <= 0) {
            return setError('Não foi possível identificar a dimensão para atualizar. Reabra o modal e tente novamente.');
        }

        const numeroTexto = String(novoNumero ?? '').trim();
        if (!numeroTexto || !nome.trim()) {
            return setError('Todos os campos são obrigatórios.');
        }

        const numeroConvertido = Number(numeroTexto);
        if (Number.isNaN(numeroConvertido) || numeroConvertido <= 0) {
            return setError('Número da dimensão inválido.');
        }

        setError('');

        editDimensaoMutation.mutate({
            numero: numeroAtual,
            data: {
                numero: numeroConvertido !== numeroAtual ? numeroConvertido : undefined,
                nome: nome.trim(),
                numero_eixos: dimensaoData.numero_eixos
            }
        }, {
            onSuccess: () => {
                if (onSuccess) onSuccess('Dimensão atualizada com sucesso');
                handleClose();
            },
            onError: (err) => {
                const backendError = err?.response?.data?.message
                    || err?.response?.data?.error
                    || err?.message;
                setError(backendError || 'Erro ao atualizar dimensão.');
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
                Fechar
            </Button>
            <Button
                onClick={handleUpdate}
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                    fontWeight: 700,
                    minWidth: '100px'
                }}
            >
                {loading ? 'Salvando...' : 'Atualizar'}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={handleClose}
            title="Editar Dimensão"
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
                    id="edit-num-dimensao"
                    label="Número da Dimensão"
                    name="numero"
                    value={novoNumero}
                    onChange={(e) => setNovoNumero(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="edit-nome-dimensao"
                    label="Nome da Dimensão"
                    name="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    autoFocus
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2 }}
                />
            </Box>
        </MuiBaseModal>
    );
};

export default ModalUpdateDimensao;
