// src/components/ModalAddDimensao.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { cadastrarDimensao } from '../../services/dimensoesService';
import './ModalAddDimensao.css'; // Adicione um arquivo CSS para customizações

const ModalAddDimensao = ({ show, handleClose, eixoNumero, onSuccess }) => {
    const [numero, setNumero] = useState('');
    const [nome, setNome] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newDimensao = { numero, nome, numero_eixos: eixoNumero };
            await cadastrarDimensao(newDimensao);
            onSuccess('Dimensão adicionada com sucesso');
            handleClose();
        } catch (error) {
            console.error('Erro ao adicionar dimensão:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Adicionar Dimensão</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-custom"> {/* Classe personalizada para o modal body */}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formNumero">
                        <Form.Label>Número</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Digite o número da dimensão"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            required
                            className="form-control-dimensao" // Classe para remover as setinhas
                        />
                    </Form.Group>
                    <Form.Group controlId="formNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Digite o nome da dimensão"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            className="form-control-dimensao" // Classe para remover as setinhas
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Adicionar
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalAddDimensao;
