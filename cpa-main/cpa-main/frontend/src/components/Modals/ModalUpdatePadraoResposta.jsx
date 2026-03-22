import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonSalvar from '../Buttons/Button_Salvar';
import { useEditPadraoRespostaMutation } from '../../hooks/mutations/usePadraoRespostaMutations';

const ModalUpdatePadraoResposta = ({ show, handleClose, padraoData, onSuccess }) => {
  const [sigla, setSigla] = useState(padraoData.sigla);
  const editMutation = useEditPadraoRespostaMutation();

  useEffect(() => {
    setSigla(padraoData.sigla);
  }, [padraoData]);

  const handleSubmit = () => {
    editMutation.mutate({ id: padraoData.id, padraoResposta: { sigla } }, {
      onSuccess: () => {
        onSuccess('Padrão de resposta atualizado com sucesso!');
      }
    });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Padrão de Resposta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formSigla">
            <Form.Label>Sigla</Form.Label>
            <Form.Control
              type="text"
              value={sigla}
              onChange={(e) => setSigla(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar variant="secondary" onClick={handleClose} disabled={editMutation.isPending}>
          Cancelar
        </ButtonCancelar>
        <ButtonSalvar variant="primary" onClick={handleSubmit} disabled={editMutation.isPending}>
          {editMutation.isPending ? 'Salvando...' : 'Salvar'}
        </ButtonSalvar>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalUpdatePadraoResposta;