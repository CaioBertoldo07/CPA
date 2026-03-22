import React from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import { BiPlus, BiMinus } from "react-icons/bi";

function DynamicInputs({ inputs, adicionarInput, removerInput, handleNumeroChange, handleNomeChange }) {
  return (
    <Box sx={{ mt: 1 }}>
      {inputs.map((input, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            mb: 2
          }}
        >
          <TextField
            label="Número"
            type="number"
            size="small"
            value={input.numero}
            onChange={(e) => handleNumeroChange(index, e.target.value)}
            placeholder="Ex: 1"
            sx={{ width: '100px' }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Nome da Dimensão"
            size="small"
            fullWidth
            value={input.nome}
            onChange={(e) => handleNomeChange(index, e.target.value)}
            placeholder="Ex: Ensino, Pesquisa..."
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ pt: 0.5, display: 'flex', gap: 1 }}>
            {index > 0 ? (
              <Tooltip title="Remover dimensão">
                <IconButton
                  onClick={() => removerInput(index)}
                  color="error"
                  size="small"
                >
                  <BiMinus />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Adicionar dimensão">
                <IconButton
                  onClick={adicionarInput}
                  color="primary"
                  size="small"
                  sx={{ backgroundColor: 'primary.light', '&:hover': { backgroundColor: 'primary.main', color: 'white' } }}
                >
                  <BiPlus />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default DynamicInputs;
