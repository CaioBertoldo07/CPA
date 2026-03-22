import React, { useEffect, useState } from "react";
import { TextField, Button, Alert, Box } from "@mui/material";
import MuiBaseModal from "../utils/MuiBaseModal";
import { useAdicionarCategoriaMutation, useEditCategoriaMutation } from "../../hooks/mutations/useCategoriaMutations";

function Modal_Categorias(props) {
    const { show, onHide, categoria, onSuccess } = props;
    const [nomecategoria, setNomeCategoria] = useState('');
    const [error, setError] = useState('');

    const adicionarMutation = useAdicionarCategoriaMutation();
    const editarMutation = useEditCategoriaMutation();
    const loading = adicionarMutation.isPending || editarMutation.isPending;

    useEffect(() => {
        if (show) {
            setNomeCategoria(categoria?.nome || '');
        } else {
            setNomeCategoria('');
            setError('');
        }
    }, [categoria, show]);

    const handleNomeCategoriaChange = (event) => setNomeCategoria(event.target.value);

    const handleSave = async () => {
        if (!nomecategoria.trim()) {
            return setError('O nome da categoria não pode estar vazio.');
        }
        setError('');

        const mutation = categoria ? editarMutation : adicionarMutation;
        const payload = categoria
            ? { id: categoria.id, categoria: { nome: nomecategoria } }
            : { nome: nomecategoria };

        mutation.mutate(payload, {
            onSuccess: (data) => {
                onHide();
                onSuccess?.(data?.message || 'Categoria salva com sucesso!');
            },
            onError: (err) => setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar categoria.')
        });
    };

    const modalActions = (
        <>
            <Button
                onClick={onHide}
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
                {categoria ? 'Atualizar' : 'Cadastrar'}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={onHide}
            title={categoria ? 'Editar Categoria' : 'Nova Categoria'}
            actions={modalActions}
            isLoading={loading}
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
                    id="nome-categoria"
                    label="Nome da Categoria"
                    name="nome"
                    autoFocus
                    value={nomecategoria}
                    onChange={handleNomeCategoriaChange}
                    disabled={loading}
                    variant="outlined"
                    placeholder="Ex: Infraestrutura, Biblioteca..."
                    InputLabelProps={{ shrink: true }}
                />
            </Box>
        </MuiBaseModal>
    );
}

export default Modal_Categorias;
