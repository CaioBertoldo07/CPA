import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonSalvar from '../Buttons/Button_Salvar';
import { useEditDimensaoMutation } from '../../hooks/mutations/useDimensaoMutations';
import { useGetDimensoesByEixoQuery } from '../../hooks/queries/useDimensaoQueries';

const ModalUpdateDimensao = ({ show, handleClose, dimensaoData, onSuccess }) => {
    const [novoNumero, setNovoNumero] = useState('');
    const [nome, setNome] = useState('');
    const [numeroEixos, setNumeroEixos] = useState('');

    const editDimensaoMutation = useEditDimensaoMutation();

    useEffect(() => {
        if (dimensaoData) {
            setNovoNumero(dimensaoData.numero);
            setNome(dimensaoData.nome);
            setNumeroEixos(dimensaoData.numero_eixos);
        }
    }, [dimensaoData]);

    const handleUpdate = async () => {
        if (!numeroEixos) return;
        editDimensaoMutation.mutate({
            numero: dimensaoData.numero,
            data: { numero: novoNumero, nome, numero_eixos: numeroEixos }
        }, {
            onSuccess: () => {
                onSuccess('Dimensão atualizada com sucesso');
                handleClose();
            }
        });
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
                <ButtonCancelar onClick={handleClose} disabled={editDimensaoMutation.isPending}>
                    Fechar
                </ButtonCancelar>
                <ButtonSalvar onClick={handleUpdate} disabled={editDimensaoMutation.isPending}>
                    {editDimensaoMutation.isPending ? 'Salvando...' : 'Atualizar'}
                </ButtonSalvar>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalUpdateDimensao;
