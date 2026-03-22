import React, { useEffect, useState } from "react";
import { TextField, Button, Box, Alert, Typography } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useAdicionarAdminMutation, useEditAdminMutation } from "../../hooks/mutations/useAdminMutations";

function Modal_Admin(props) {
    const { show, admin, onHide, onSuccess } = props;
    const [nomeAdmin, setNomeAdmin] = useState('');
    const [emailAdmin, setEmailAdmin] = useState('');
    const [error, setError] = useState('');

    const adicionarAdminMutation = useAdicionarAdminMutation();
    const editAdminMutation = useEditAdminMutation();
    const isLoading = adicionarAdminMutation.isPending || editAdminMutation.isPending;

    useEffect(() => {
        if (show) {
            if (admin) {
                setNomeAdmin(admin.nome || '');
                setEmailAdmin(admin.email || '');
            } else {
                setNomeAdmin('');
                setEmailAdmin('');
            }
            setError('');
        }
    }, [admin, show]);

    const handleSave = async () => {
        if (!nomeAdmin.trim() || !emailAdmin.trim()) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        const adminData = {
            nome: nomeAdmin.trim(),
            email: emailAdmin.trim(),
        };

        if (admin) {
            editAdminMutation.mutate({ id: admin.id, ...adminData }, {
                onSuccess: (data) => {
                    onSuccess?.(data.message || 'Administrador atualizado com sucesso!');
                    onHide();
                },
                onError: (err) => {
                    setError(err.response?.data?.error || 'Erro ao atualizar administrador');
                }
            });
        } else {
            adicionarAdminMutation.mutate(adminData, {
                onSuccess: () => {
                    onSuccess?.('Administrador cadastrado com sucesso!');
                    onHide();
                },
                onError: (err) => {
                    setError(err.response?.data?.error || 'Erro ao cadastrar administrador');
                }
            });
        }
    };

    const modalActions = (
        <>
            <Button
                onClick={onHide}
                color="inherit"
                disabled={isLoading}
                sx={{ fontWeight: 600 }}
            >
                Cancelar
            </Button>
            <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{
                    fontWeight: 700,
                    minWidth: '100px'
                }}
            >
                {isLoading ? 'Salvando...' : (admin ? 'Salvar Alterações' : 'Cadastrar Admin')}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={onHide}
            title={admin ? 'Editar Administrador' : 'Novo Administrador'}
            actions={modalActions}
            isLoading={isLoading}
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
                        label="Nome"
                        variant="outlined"
                        value={nomeAdmin}
                        onChange={(e) => setNomeAdmin(e.target.value)}
                        disabled={isLoading}
                        placeholder="Nome completo"
                        autoFocus
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        type="email"
                        value={emailAdmin}
                        onChange={(e) => setEmailAdmin(e.target.value)}
                        disabled={isLoading}
                        placeholder="exemplo@email.com"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </Box>
        </MuiBaseModal>
    );
}

export default Modal_Admin;
