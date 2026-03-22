import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import Dinamico_PadraoResposta from '../utils/Dinamico_PadraoResposta';
import { useAdicionarAlternativaMutation } from '../../hooks/mutations/useAlternativaMutations';

function ModalAddAlternativa({ show, handleClose, paraoNumero, onSuccess }) {
  const [alternativas, setAlternativas] = useState([{ descricao: '' }]);
  const [error, setError] = useState('');

  const adicionarMutation = useAdicionarAlternativaMutation();
  const loading = adicionarMutation.isPending;

  useEffect(() => {
    if (!show) {
      setAlternativas([{ descricao: '' }]);
      setError('');
    }
  }, [show]);

  const handleSubmit = async () => {
    try {
      const validAlternativas = alternativas.filter(a => a.descricao && a.descricao.trim());

      if (validAlternativas.length === 0) {
        return setError('Adicione pelo menos uma alternativa preenchida.');
      }

      setError('');

      for (const alternativa of validAlternativas) {
        const newAlternativa = { descricao: alternativa.descricao.trim(), id_padrao_resp: paraoNumero };
        await adicionarMutation.mutateAsync(newAlternativa);
      }

      onSuccess('Alternativas adicionadas com sucesso');
      handleClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao adicionar alternativas.');
    }
  };

  const handleAlternativaChange = (index, value) => {
    const updatedAlternativas = [...alternativas];
    updatedAlternativas[index].descricao = value;
    setAlternativas(updatedAlternativas);
  };

  const addAlternativaField = () => {
    setAlternativas([...alternativas, { descricao: '' }]);
  };

  const removeAlternativaField = (index) => {
    if (alternativas.length <= 1) return;
    const updatedAlternativas = [...alternativas];
    updatedAlternativas.splice(index, 1);
    setAlternativas(updatedAlternativas);
  };

  const modalActions = (
    <>
      <Button onClick={handleClose} color="inherit" disabled={loading} sx={{ fontWeight: 600 }}>
        Cancelar
      </Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ fontWeight: 700, minWidth: '120px' }}
      >
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </>
  );

  return (
    <MuiBaseModal
      open={show}
      onClose={handleClose}
      title="Nova Alternativa"
      actions={modalActions}
      isLoading={loading}
      maxWidth="md"
    >
      <Box sx={{ mt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
          Alternativas do Padrão
        </Typography>

        <Dinamico_PadraoResposta
          inputs={alternativas}
          adicionarInput={addAlternativaField}
          removerInput={removeAlternativaField}
          handlePadraoChange={handleAlternativaChange}
        />
      </Box>
    </MuiBaseModal>
  );
}

export default ModalAddAlternativa;
