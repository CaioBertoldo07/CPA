import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useEditPadraoRespostaMutation } from '../../hooks/mutations/usePadraoRespostaMutations';

function ModalUpdatePadraoResposta({ show, handleClose, padraoData, onSuccess }) {
  const [sigla, setSigla] = useState('');
  const [error, setError] = useState('');

  const editMutation = useEditPadraoRespostaMutation();
  const loading = editMutation.isPending;

  useEffect(() => {
    if (padraoData && show) {
      setSigla(padraoData.sigla || '');
      setError('');
    }
  }, [padraoData, show]);

  const handleSubmit = () => {
    if (!sigla.trim()) {
      return setError('A sigla não pode estar vazia.');
    }

    editMutation.mutate({ id: padraoData.id, padraoResposta: { sigla: sigla.trim() } }, {
      onSuccess: () => {
        if (onSuccess) onSuccess('Padrão de resposta atualizado com sucesso!');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.error || 'Erro ao atualizar padrão de resposta.');
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
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </>
  );

  return (
    <MuiBaseModal
      open={show}
      onClose={handleClose}
      title="Editar Padrão de Resposta"
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

        <TextField
          fullWidth
          label="Sigla / Nome"
          value={sigla}
          onChange={(e) => setSigla(e.target.value)}
          disabled={loading}
          variant="outlined"
          autoFocus
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    </MuiBaseModal>
  );
}

export default ModalUpdatePadraoResposta;