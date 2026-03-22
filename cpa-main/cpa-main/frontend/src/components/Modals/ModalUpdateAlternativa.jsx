import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useEditAlternativaMutation } from '../../hooks/mutations/useAlternativaMutations';

function ModalUpdateAlternativa({ show, handleClose, onSuccess, alternativa }) {
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState('');

  const editMutation = useEditAlternativaMutation();
  const loading = editMutation.isPending;

  useEffect(() => {
    if (alternativa && alternativa.descricao && show) {
      setDescricao(alternativa.descricao);
      setError('');
    }
  }, [alternativa, show]);

  const handleSave = () => {
    if (!alternativa?.id) return;
    if (!descricao.trim()) {
      return setError('A descrição da alternativa não pode estar vazia.');
    }
    setError('');

    editMutation.mutate({
      id: alternativa.id,
      alternativa: { ...alternativa, descricao: descricao.trim() }
    }, {
      onSuccess: () => {
        onSuccess("Alternativa atualizada com sucesso!");
        handleClose();
      },
      onError: (err) => {
        setError(err?.response?.data?.message || err?.response?.data?.error || "Erro ao atualizar alternativa.");
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
        onClick={handleSave}
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{
          fontWeight: 700,
          minWidth: '100px'
        }}
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </>
  );

  return (
    <MuiBaseModal
      open={show}
      onClose={handleClose}
      title="Editar Alternativa"
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
          id="desc-alternativa"
          label="Descrição da Alternativa"
          name="descricao"
          autoFocus
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={loading}
          variant="outlined"
          placeholder="Ex: Concordo totalmente"
          InputLabelProps={{ shrink: true }}
          multiline
          rows={3}
        />
      </Box>
    </MuiBaseModal>
  );
}

export default ModalUpdateAlternativa;