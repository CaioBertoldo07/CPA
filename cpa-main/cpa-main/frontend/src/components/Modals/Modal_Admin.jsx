import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import ButtonCancelar from "../Buttons/Button_Cancelar";
import ButtonCadastrar from "../Buttons/Button_Cadastrar";
import { useAdicionarAdminMutation, useEditAdminMutation } from "../../hooks/mutations/useAdminMutations";

function Modal_Admin(props) {
    const [nomeAdmin, setNomeAdmin] = useState('');
    const [emailAdmin, setEmailAdmin] = useState('');
    const [error, setError] = useState('');

    const adicionarAdminMutation = useAdicionarAdminMutation();
    const editAdminMutation = useEditAdminMutation();

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

        const adminData = {
            nome: nomeAdmin,
            email: emailAdmin,
        };

        if (props.admin) {
            editAdminMutation.mutate({ id: props.admin.id, ...adminData }, {
                onSuccess: (data) => {
                    props.onSuccess(data.message || 'Administrador atualizado com sucesso!');
                    props.onHide();
                },
                onError: (err) => {
                    setError(err.response?.data?.error || 'Erro ao atualizar administrador');
                }
            });
        } else {
            adicionarAdminMutation.mutate(adminData, {
                onSuccess: () => {
                    props.onSuccess('Administrador cadastrado com sucesso!');
                    props.onHide();
                },
                onError: (err) => {
                    setError(err.response?.data?.error || 'Erro ao cadastrar administrador');
                }
            });
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
                <ButtonCancelar onClick={props.onHide} disabled={adicionarAdminMutation.isPending || editAdminMutation.isPending}>
                    Cancelar
                </ButtonCancelar>
                <ButtonCadastrar onClick={handleCadastrarAdmin} disabled={adicionarAdminMutation.isPending || editAdminMutation.isPending}>
                    {adicionarAdminMutation.isPending || editAdminMutation.isPending ? 'Salvando...' : (props.admin ? 'Atualizar' : 'Cadastrar')}
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default Modal_Admin;
