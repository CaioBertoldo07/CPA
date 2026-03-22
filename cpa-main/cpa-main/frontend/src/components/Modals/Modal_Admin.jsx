import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import ButtonCancelar from "../Buttons/Button_Cancelar";
import ButtonCadastrar from "../Buttons/Button_Cadastrar";
import { cadastrarAdmin, updateAdmin } from "../../services/adminService";

function Modal_Admin(props) {
    const [nomeAdmin, setNomeAdmin] = useState('');
    const [emailAdmin, setEmailAdmin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (props.show) {
            if (props.admin) {
                setNomeAdmin(props.admin.nome || '');
                setEmailAdmin(props.admin.email || '');
            } else {
                setNomeAdmin('');
                setEmailAdmin('');
            }
        } else {
            setNomeAdmin('');
            setEmailAdmin('');
            setError('');
            setSuccess('');
        }
    }, [props.admin, props.show]);

    const handleNomeAdminChange = (event) => {
        setNomeAdmin(event.target.value);
    };

    const handleEmailAdminChange = (event) => {
        setEmailAdmin(event.target.value);
    };

    const handleCadastrarAdmin = async () => {
        if (!nomeAdmin.trim() || !emailAdmin.trim()) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        try {
            const adminData = {
                nome: nomeAdmin,
                email: emailAdmin,
            };

            if (props.admin) {
                await handleUpdateAdmin(props.admin.id, adminData);
            } else {
                await cadastrarAdmin(adminData);
            }

            setSuccess('Administrador salvo com sucesso!');
            props.onHide();
            props.onSuccess('Administrador salvo com sucesso!');
        } catch (error) {
            setSuccess('');
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Erro ao salvar administrador');
            }
        }
    };

    const handleUpdateAdmin = async (id, adminAtualizado) => {
        try {
            const data = await updateAdmin(id, adminAtualizado);
            props.onSuccess(data.message);
        } catch (error) {
            console.error('Erro ao atualizar o administrador:', error);
        }
    };

    return (
        <Modal {...props} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.admin ? 'Editar Administrador' : 'Novo Administrador'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '20px' }}>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <h6 style={{ marginBottom: '10px' }}>Nome</h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input
                        type="text"
                        value={nomeAdmin}
                        onChange={handleNomeAdminChange}
                        placeholder="Nome"
                        className="input-field"
                        style={{ width: '100%', maxWidth: '300px', padding: '5px 10px' }}
                    />
                </div>
                <h6 style={{ marginBottom: '10px', marginTop: '20px' }}>Email</h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input
                        type="email"
                        value={emailAdmin}
                        onChange={handleEmailAdminChange}
                        placeholder="Email"
                        className="input-field"
                        style={{ width: '100%', maxWidth: '300px', padding: '5px 10px' }}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar onClick={props.onHide}>Cancelar</ButtonCancelar>
                <ButtonCadastrar onClick={handleCadastrarAdmin}>
                    {props.admin ? 'Atualizar' : 'Cadastrar'}
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default Modal_Admin;
