import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import { useEditAlternativaMutation } from '../../hooks/mutations/useAlternativaMutations';

function ModalUpdateAlternativa({ show, handleClose, onSuccess, alternativa }) {
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState('');

  const editMutation = useEditAlternativaMutation();

  useEffect(() => {
    if (alternativa && alternativa.descricao) {
      setDescricao(alternativa.descricao);
    }
  }, [alternativa]);

  const handleSave = () => {
    if (!alternativa?.id) return;

    editMutation.mutate({ id: alternativa.id, alternativa: { ...alternativa, descricao } }, {
      onSuccess: () => {
        onSuccess("Alternativa atualizada com sucesso!");
        handleClose();
      },
      onError: () => {
        setError("Erro ao atualizar alternativa.");
      }
    });
  };


  return (
    <Modal show={show} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Nova Alternativa
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <h6>Alternativas</h6>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={{
            border: '1px solid',
            borderRadius: '4px',
            padding: '8px',
            boxSizing: 'border-box',
            margin: '5px 0'
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar onClick={handleClose} disabled={editMutation.isPending}>Cancelar</ButtonCancelar>
        <ButtonCadastrar onClick={handleSave} disabled={editMutation.isPending}>
          {editMutation.isPending ? 'Salvando...' : 'Salvar'}
        </ButtonCadastrar>
      </Modal.Footer>
    </Modal>
  );
}
export default ModalUpdateAlternativa;