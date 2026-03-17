import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';
import { updateModalidades } from '../../services/modalidadesService'; // Importação correta
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';

function ModalUpdateModalidades({ show, modalidade, onClose, onSave }) {
    const [modEnsino, setModEnsino] = useState('');
    const [modOferta, setModOferta] = useState('');

    // Usando o useEffect para atualizar os estados locais sempre que `modalidade` mudar
    useEffect(() => {
        if (modalidade) {
            setModEnsino(modalidade.mod_ensino || '');
            setModOferta(modalidade.mod_oferta || '');
        }
    }, [modalidade]); // Dependência em `modalidade`

    const handleSave = async () => {
        if (!modalidade.id) {
            console.error("ID da modalidade não definido.");
            return;
        }
        try {
            const updatedModalidade = {
                ...modalidade,
                mod_ensino: modEnsino,
                mod_oferta: modOferta,
            };
            console.log("Atualizando modalidade com ID:", modalidade.id); // Log para debug
            await updateModalidades(modalidade.id, updatedModalidade); // Chamada de função de atualização com o ID
            onSave(updatedModalidade); // Passa os dados atualizados para o componente pai
            onClose(); // Fecha o modal após salvar
        } catch (error) {
            console.error("Erro ao atualizar modalidade:", error);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Modalidade</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h6>Ensino</h6>
                <input
                    type="text"
                    value={modEnsino}
                    onChange={(e) => setModEnsino(e.target.value)}
                    style={{
                        border: '1px solid',
                        borderRadius: '4px',
                        padding: '8px',
                        boxSizing: 'border-box',
                        margin: '5px 0'
                    }}
                />
                <h6>Oferta</h6>
                <input
                    type="text"
                    value={modOferta}
                    onChange={(e) => setModOferta(e.target.value)}
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
                <ButtonCancelar variant="secondary" onClick={onClose}>Cancelar</ButtonCancelar>
                <ButtonCadastrar variant="primary" onClick={handleSave}>Salvar</ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalUpdateModalidades;
