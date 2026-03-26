import React, { useState, useEffect } from 'react';
import { TextField, Button, Alert, Box, Grid, Typography, Divider } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import DynamicInputs from '../utils/Inputs_Dinamico';
import { useAdicionarEixoMutation } from '../../hooks/mutations/useEixoMutations';

function Modal_Eixos({ show, onHide, onSuccess }) {
  const [eixoNome, setEixoNome] = useState('');
  const [numeroEixo, setNumeroEixo] = useState('');
  const [dimensoes, setDimensoes] = useState([{ numero: '', nome: '' }]);
  const [error, setError] = useState('');

  const adicionarEixoMutation = useAdicionarEixoMutation();
  const loading = adicionarEixoMutation.isPending;

  useEffect(() => {
    if (show) {
      setEixoNome('');
      setNumeroEixo('');
      setDimensoes([{ numero: '', nome: '' }]);
      setError('');
    }
  }, [show]);

  const addDimensaoField = () => setDimensoes([...dimensoes, { numero: '', nome: '' }]);
  const removeDimensaoField = (index) => setDimensoes(dimensoes.filter((_, i) => i !== index));

  const handleNumeroChange = (index, value) => {
    const newDimensoes = [...dimensoes];
    newDimensoes[index].numero = value;
    setDimensoes(newDimensoes);
  };

  const handleNomeChange = (index, value) => {
    const newDimensoes = [...dimensoes];
    newDimensoes[index].nome = value;
    setDimensoes(newDimensoes);
  };

  const handleSave = () => {
    const parsedNumeroEixo = parseInt(numeroEixo.trim(), 10);
    const parsedDimensoes = dimensoes.map(d => ({
      ...d,
      numero: parseInt(d.numero, 10)
    }));

    if (isNaN(parsedNumeroEixo)) {
      return setError('O número do eixo deve ser um valor numérico válido.');
    }

    if (parsedDimensoes.some(d => isNaN(d.numero))) {
      return setError('Todas as dimensões devem ter um número válido.');
    }

    adicionarEixoMutation.mutate({
      nome: eixoNome.trim(),
      numero: parsedNumeroEixo,
      dimensoes: parsedDimensoes
    }, {
      onSuccess: () => {
        onHide();
        if (onSuccess) onSuccess('Eixo cadastrado com sucesso!');
      },
      onError: (err) => setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao cadastrar eixo.')
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
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </>
  );

  return (
    <MuiBaseModal
      open={show}
      onClose={onHide}
      title="Cadastro de Novo Eixo"
      actions={modalActions}
      isLoading={loading}
      maxWidth="md"
    >
      <Box sx={{ mt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>
          Informações do Eixo
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              required
              fullWidth
              label="Número"
              type="number"
              value={numeroEixo}
              onChange={(e) => setNumeroEixo(e.target.value)}
              disabled={loading}
              placeholder="Ex: 1"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              required
              fullWidth
              label="Nome do Eixo"
              value={eixoNome}
              onChange={(e) => setEixoNome(e.target.value)}
              disabled={loading}
              placeholder="Ex: Eixo 1 - Planejamento e Avaliação Institucional"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase' }}>
          Dimensões Vinculadas
        </Typography>

        <DynamicInputs
          inputs={dimensoes}
          adicionarInput={addDimensaoField}
          removerInput={removeDimensaoField}
          handleNumeroChange={handleNumeroChange}
          handleNomeChange={handleNomeChange}
        />
      </Box>
    </MuiBaseModal>
  );
}

export default Modal_Eixos;