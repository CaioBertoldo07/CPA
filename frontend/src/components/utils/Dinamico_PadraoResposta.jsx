import React from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import { BiPlus, BiMinus } from "react-icons/bi";

/**
 * Dinamico_PadraoResposta - Standardized MUI dynamic alternatives input
 * 
 * @param {Array} inputs - [{ descricao: '' }, ...]
 * @param {function} adicionarInput - Add new row
 * @param {function} removerInput - Remove specific row
 * @param {function} handlePadraoChange - (index, value) handler
 */
function Dinamico_PadraoResposta({ inputs, adicionarInput, removerInput, handlePadraoChange }) {
  return (
    <Box sx={{ mt: 1 }}>
      {inputs.map((input, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2
          }}
        >
          <TextField
            fullWidth
            label={`Alternativa ${index + 1}`}
            size="small"
            value={input.descricao || ''}
            onChange={(e) => handlePadraoChange(index, e.target.value)}
            placeholder="Ex: Concordo Totalmente"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {index > 0 ? (
              <Tooltip title="Remover alternativa">
                <IconButton
                  onClick={() => removerInput(index)}
                  color="error"
                  size="small"
                >
                  <BiMinus />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Adicionar alternativa">
                <IconButton
                  onClick={adicionarInput}
                  color="primary"
                  size="small"
                  sx={{
                    backgroundColor: 'primary.light',
                    '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                  }}
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

export default Dinamico_PadraoResposta;