import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { updateDimensao, getDimensoesByEixo } from '../../services/dimensoesService';
import ButtonCancelar from "../Buttons/Button_Cancelar";
import ButtonSalvar from "../Buttons/Button_Salvar";
const ModalUpdateDimensao = ({ show, handleClose, dimensaoData, onSuccess }) => {
    const [numero, setNumero] = useState('');
    const [novoNumero, setNovoNumero] = useState('');
    const [nome, setNome] = useState('');
    const [numeroEixos, setNumeroEixos] = useState('');

    useEffect(() => {
        if (dimensaoData) {
            setNumero(dimensaoData.numero);
            setNovoNumero(dimensaoData.numero); // Se desejar permitir a mudança do número
            setNome(dimensaoData.nome);
            // Buscar número do eixo automaticamente
            const fetchEixo = async () => {
                try {
                    const dimensoes = await getDimensoesByEixo(dimensaoData.numero_eixos);
                    if (dimensoes.length > 0) {
                        setNumeroEixos(dimensaoData.numero_eixos); // Atualiza com o número do eixo da dimensão
                    }
                } catch (error) {
                    console.error('Erro ao buscar dimensões:', error);
                }
            };
            fetchEixo();
        }
    }, [dimensaoData]);

    const handleUpdate = async () => {
        try {
            if (!numeroEixos) {
                console.error('Número do eixo não definido.');
                return;
            }

            await updateDimensao(numero, { novoNumero, nome, numero_eixos: numeroEixos });
            onSuccess('Dimensão atualizada com sucesso');
            handleClose();
        } catch (error) {
            console.error('Erro ao atualizar dimensão', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Dimensão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formNumero">
                        <Form.Label>Número</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Digite o número da dimensão"
                            value={novoNumero}
                            onChange={(e) => setNovoNumero(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Digite o nome da dimensão"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar variant="secondary" onClick={handleClose}>
                    Fechar
                </ButtonCancelar>
                <ButtonSalvar variant="primary" onClick={handleUpdate}>
                    Atualizar
                </ButtonSalvar>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalUpdateDimensao;
