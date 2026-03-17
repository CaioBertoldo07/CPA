import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { editarEixo } from '../../services/eixosService';
import { updateDimensao } from '../../services/dimensoesService';

const ModalUpdate = ({ show, handleClose, eixoData, onSuccess, isEditingDimensao }) => {
  const [formData, setFormData] = useState({ numero: '', nome: '', numero_eixos: '' });

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
    try {
      if (isEditingDimensao) {
        await updateDimensao(formData);
      } else {
        await editarEixo(formData);
      }
      onSuccess('Item atualizado com sucesso'); // Atualiza a tabela após o sucesso
    } catch (error) {
      console.error('Erro ao atualizar item', error);
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
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalUpdate;
