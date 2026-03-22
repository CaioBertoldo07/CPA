import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Spinner } from 'react-bootstrap';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import { useEditModalidadeMutation } from '../../hooks/mutations/useModalidadeMutations';

function ModalUpdateModalidades({ show, modalidade, onClose, onSave }) {
    const [modEnsino, setModEnsino] = useState('');
    const [modOferta, setModOferta] = useState('');
    const [error, setError] = useState('');

    const mutation = useEditModalidadeMutation();
    const loading = mutation.isPending;

    useEffect(() => {
        if (modalidade) {
            setModEnsino(modalidade.mod_ensino || '');
            setModOferta(modalidade.mod_oferta || '');
            setError('');
        }
    }, [modalidade]);

    const handleSave = () => {
        if (!modEnsino.trim()) return setError('Ensino é obrigatório.');

        mutation.mutate({ id: modalidade.id, data: { mod_ensino: modEnsino, mod_oferta: modOferta } }, {
            onSuccess: (data) => {
                onSave?.(data?.message || 'Modalidade atualizada!');
                onClose();
            },
            onError: (err) => setError(err?.response?.data?.error || 'Erro ao atualizar modalidade.')
        });
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Modalidade</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}
                <h6>Ensino</h6>
                <input
                    type="text"
                    value={modEnsino}
                    onChange={(e) => setModEnsino(e.target.value)}
                    style={{ border: '1px solid', borderRadius: '4px', padding: '8px', boxSizing: 'border-box', margin: '5px 0', width: '100%', maxWidth: '300px' }}
                    disabled={loading}
                />
                <h6>Oferta</h6>
                <input
                    type="text"
                    value={modOferta}
                    onChange={(e) => setModOferta(e.target.value)}
                    style={{ border: '1px solid', borderRadius: '4px', padding: '8px', boxSizing: 'border-box', margin: '5px 0', width: '100%', maxWidth: '300px' }}
                    disabled={loading}
                />
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar variant="secondary" onClick={onClose} disabled={loading}>Cancelar</ButtonCancelar>
                <ButtonCadastrar variant="primary" onClick={handleSave} disabled={loading}>
                    {loading ? <><Spinner size="sm" animation="border" className="me-2" /> Salvando...</> : 'Salvar'}
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalUpdateModalidades;
