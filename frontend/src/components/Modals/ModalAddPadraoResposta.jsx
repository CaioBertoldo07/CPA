import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert, Typography, Divider } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import Dinamico_PadraoResposta from '../utils/Dinamico_PadraoResposta';
import { useAdicionarPadraoRespostaMutation } from '../../hooks/mutations/usePadraoRespostaMutations';

function ModalAddPadraoResposta(props) {
  const { show, onHide, onSuccess, data: initialData } = props;
  const [sigla, setSigla] = useState('');
  const [alternativas, setAlternativas] = useState([{ descricao: '' }]);
  // const [alternativas,setAlternativas] = useState([])
  const [error, setError] = useState('');

  const adicionarMutation = useAdicionarPadraoRespostaMutation();
  const loading = adicionarMutation.isPending;

  useEffect(() => {
    if (initialData && show) {
      setSigla(initialData.sigla || '');
      setAlternativas(initialData.alternativas || [{ descricao: '' }]);
      setError('');
    } else if (!show) {
      resetForm();
    }
  }, [initialData, show]);

  const resetForm = () => {
    setSigla('');
    setAlternativas([{ descricao: '' }]);
    setError('');
  };

  const handleSiglaChange = (event) => setSigla(event.target.value);

  const handleAlternativaChange = (index, value) => {
    const updatedAlternativas = [...alternativas];
    updatedAlternativas[index].descricao = value;
    setAlternativas(updatedAlternativas);
  };

  const addAlternativaField = () => {
    setAlternativas([...alternativas, { descricao: '' }]);
    console.log('Alternativas:', alternativas);
  };

  const removeAlternativaField = (index) => {
    const updatedAlternativas = [...alternativas];
    updatedAlternativas.splice(index, 1);
    setAlternativas(updatedAlternativas);
  };

  const handleCadastrarPadraoResposta = () => {
    console.log('Estado das alternativas:', alternativas);
    if (!sigla.trim()) {
      return setError('A sigla é obrigatória.');
    }

    const validAlternativas = alternativas.filter(a => a.descricao && a.descricao.trim());
    if (validAlternativas.length === 0) {
      return setError('Adicione pelo menos uma alternativa válida.');
    }

    const payload = {
      sigla: sigla.trim(),
      alternativas: validAlternativas
    };

    adicionarMutation.mutate(payload, {
      onSuccess: () => {
        resetForm();
        onHide();
        if (onSuccess) onSuccess('Padrão de resposta cadastrado com sucesso!');
      },
      onError: (err) => {
        setError(err.response?.data?.error || 'Erro ao cadastrar padrão de resposta.');
      }
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
        onClick={handleCadastrarPadraoResposta}
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{
          fontWeight: 700,
          minWidth: '120px'
        }}
      >
        {loading ? 'Cadastrando...' : 'Cadastrar Scale'}
      </Button>
    </>
  );

  return (
    <MuiBaseModal
      open={show}
      onClose={onHide}
      title="Novo Padrão de Resposta (Escala)"
      actions={modalActions}
      isLoading={loading}
      maxWidth="sm"
    >
      <Box sx={{ mt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Identificação
        </Typography>
        <TextField
          fullWidth
          required
          label="Sigla / Nome do Padrão"
          value={sigla}
          onChange={handleSiglaChange}
          placeholder="Ex: Likert 5 pontos"
          disabled={loading}
          variant="outlined"
          sx={{ mt: 1, mb: 3 }}
          InputLabelProps={{ shrink: true }}
          autoFocus
        />

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
            Alternativas da Escala
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {alternativas.length} item(s)
          </Typography>
        </Box>

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

export default ModalAddPadraoResposta;