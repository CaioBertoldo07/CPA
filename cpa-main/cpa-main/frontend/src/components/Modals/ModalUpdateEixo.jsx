import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useEditEixoMutation } from '../../hooks/mutations/useEixoMutations';
import { useEditDimensaoMutation } from '../../hooks/mutations/useDimensaoMutations';

const ModalUpdate = ({ show, handleClose, eixoData, onSuccess, isEditingDimensao }) => {
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
      editDimensaoMutation.mutate({ numero: formData.numero, data: { nome: formData.nome, numero_eixos: formData.numero_eixos } }, {
        onSuccess: () => {
          onSuccess('Dimensão atualizada com sucesso');
          handleClose();
        }
      });
    } else {
      editEixoMutation.mutate({ numero: formData.numero, data: { nome: formData.nome } }, {
        onSuccess: () => {
          onSuccess('Eixo atualizado com sucesso');
          handleClose();
        }
      });
    }
  };


  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditingDimensao ? 'Editar Dimensão' : 'Editar Eixo'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNumero">
            <Form.Label>Número</Form.Label>
            <Form.Control
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formNome">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
            />
          </Form.Group>
          {isEditingDimensao && (
            <Form.Group controlId="formNumeroEixos">
              <Form.Label>Número do Eixo</Form.Label>
              <Form.Control
                type="text"
                name="numero_eixos"
                value={formData.numero_eixos}
                onChange={handleChange}
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalUpdate;
