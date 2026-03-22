import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Grid } from '@mui/material';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useEditEixoMutation } from '../../hooks/mutations/useEixoMutations';
import { useEditDimensaoMutation } from '../../hooks/mutations/useDimensaoMutations';

const ModalUpdateEixo = ({ show, handleClose, eixoData, onSuccess, isEditingDimensao }) => {
  const [formData, setFormData] = useState({ numero: '', nome: '', numero_eixos: '' });

  const editEixoMutation = useEditEixoMutation();
  const editDimensaoMutation = useEditDimensaoMutation();

  const isPending = editEixoMutation.isPending || editDimensaoMutation.isPending;

  useEffect(() => {
    if (eixoData) {
      setFormData({
        numero: eixoData.numero,
        nome: eixoData.nome,
        numero_eixos: eixoData.numero_eixos || '',
      });
    }
  }, [eixoData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (isEditingDimensao) {
      editDimensaoMutation.mutate({
        numero: formData.numero,
        data: { nome: formData.nome, numero_eixos: formData.numero_eixos }
      }, {
        onSuccess: () => {
          onSuccess('Dimensão atualizada com sucesso');
          handleClose();
        }
      });
    } else {
      editEixoMutation.mutate({
        numero: formData.numero,
        data: { nome: formData.nome }
      }, {
        onSuccess: () => {
          onSuccess('Eixo atualizado com sucesso');
          handleClose();
        }
      });
    }
  };

  const modalActions = (
    <>
      <Button
        onClick={handleClose}
        color="inherit"
        disabled={isPending}
        sx={{ fontWeight: 600 }}
      >
        Cancelar
      </Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        disabled={isPending}
        sx={{
          fontWeight: 700,
          minWidth: '100px'
        }}
      >
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </>
  );

  return (
    <MuiBaseModal
      open={show}
      onClose={handleClose}
      title={isEditingDimensao ? 'Editar Dimensão' : 'Editar Eixo'}
      actions={modalActions}
      isLoading={isPending}
      maxWidth="sm"
    >
      <Box component="form" noValidate sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              margin="normal"
              fullWidth
              label="Número (Identificador)"
              name="numero"
              value={formData.numero}
              disabled={true} // Fixed identifier
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              helperText="O número identificador não pode ser alterado."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              disabled={isPending}
              variant="outlined"
              autoFocus
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {isEditingDimensao && (
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Número do Eixo"
                name="numero_eixos"
                value={formData.numero_eixos}
                onChange={handleChange}
                disabled={isPending}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                placeholder="Ex: 1"
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </MuiBaseModal>
  );
};

export default ModalUpdateEixo;
