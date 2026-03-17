import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import Modal from 'react-bootstrap/Modal';
import React, { useState } from 'react';
import { cadastrarModalidades } from '../../services/modalidadesService';



function Modal_Modalidades(props) {
    const [modEnsino, setModEnsino] = useState('');
    const [modOferta, setModOferta] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCadastrarModalidade = async () => {
        try {
            const modalidadeData = {
                mod_ensino: modEnsino,
                mod_oferta: modOferta
    
            };

            const response = await cadastrarModalidades(modalidadeData);
            setSuccess('Modalidade cadastrada com sucesso!');
            setError('');
            props.onHide();
            
        } catch (error) {
            console.error('Erro ao cadastrar modalidade:', error);
            setSuccess('');
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Erro ao cadastrar modalidade');
            }
        }
    };

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Nova modalidade
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ marginLeft: '20px' }}>
                <h6>Ensino</h6>
                <input
                    type="text"
                    value={modEnsino}
                    onChange={(e) => setModEnsino(e.target.value)}
                    style={{
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        boxSizing: 'border-box',
                        margin: '5px 0'
                    }}
                />
                <p> </p>
                <h6>Oferta</h6>
                <input
                    type="text"
                    value={modOferta}
                    style={{
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        boxSizing: 'border-box',
                        margin: '5px 0'
                    }}
                    onChange={(e) => setModOferta(e.target.value)}
                />
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>{success}</div>}
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar onClick={props.onHide}>Cancelar</ButtonCancelar>
                <ButtonCadastrar onClick={handleCadastrarModalidade}>Cadastrar</ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default Modal_Modalidades;
