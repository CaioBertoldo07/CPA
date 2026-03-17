import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { editarPadraoResposta } from '../../services/padraoRespostaService';
import ButtonCancelar from "../Buttons/Button_Cancelar";
import ButtonSalvar from "../Buttons/Button_Salvar";
const ModalUpdatePadraoResposta = ({ show, handleClose, padraoData, onSuccess }) => {
  const [sigla, setSigla] = useState(padraoData.sigla);

  useEffect(() => {
    setSigla(padraoData.sigla);
  }, [padraoData]);

  const handleSubmit = async () => {
    try {
      console.log("Padraaaaaaaao:", padraoData)
      await editarPadraoResposta(padraoData.id, { "sigla": sigla });
      onSuccess('Padrão de resposta atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating padraoResposta', error);
    }
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
        <ButtonCancelar variant="secondary" onClick={handleClose}>
          Cancelar
        </ButtonCancelar>
        <ButtonSalvar variant="primary" onClick={handleSubmit}>
          Salvar
        </ButtonSalvar>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalUpdatePadraoResposta;