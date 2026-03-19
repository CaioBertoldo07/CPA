// src/components/Modals/Modal_Modalidades.js
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import Modal from 'react-bootstrap/Modal';
import React, { useState } from 'react';
import { cadastrarModalidades } from '../../services/modalidadesService';

function Modal_Modalidades({ show, onHide, onSuccess }) {
    const [modEnsino, setModEnsino] = useState('');
    const [modOferta, setModOferta] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setModEnsino('');
        setModOferta('');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    const handleCadastrarModalidade = async () => {
        if (!modEnsino.trim()) {
            setError('O campo "Modalidade de ensino" é obrigatório.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await cadastrarModalidades({
                mod_ensino: modEnsino.trim(),
                mod_oferta: modOferta.trim()
            });

            resetForm();
            onHide();

            // Notifica o pai para atualizar a lista e exibir toast
            if (onSuccess) onSuccess('Modalidade cadastrada com sucesso!');
        } catch (err) {
            console.error('Erro ao cadastrar modalidade:', err);
            const msg = err?.response?.data?.error || 'Erro ao cadastrar modalidade.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            aria-labelledby="modal-modalidade-title"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="modal-modalidade-title">
                    Nova Modalidade
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ marginLeft: '20px' }}>
                <h6>Ensino <span style={{ color: 'red' }}>*</span></h6>
                <input
                    type="text"
                    value={modEnsino}
                    onChange={(e) => setModEnsino(e.target.value)}
                    placeholder="Ex: REGULAR"
                    style={{
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        boxSizing: 'border-box',
                        margin: '5px 0',
                        width: '100%',
                        maxWidth: '300px'
                    }}
                />

                <p style={{ margin: '8px 0' }}></p>

                <h6>Oferta</h6>
                <input
                    type="text"
                    value={modOferta}
                    placeholder="Ex: PRESENCIAL"
                    style={{
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        boxSizing: 'border-box',
                        margin: '5px 0',
                        width: '100%',
                        maxWidth: '300px'
                    }}
                    onChange={(e) => setModOferta(e.target.value)}
                />

                {error && (
                    <div className="alert alert-danger mt-3" role="alert">
                        {error}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <ButtonCancelar onClick={handleClose} disabled={loading}>
                    Cancelar
                </ButtonCancelar>
                <ButtonCadastrar onClick={handleCadastrarModalidade} disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default Modal_Modalidades;