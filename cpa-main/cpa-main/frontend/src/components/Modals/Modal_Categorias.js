import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import ButtonCancelar from "../Buttons/Button_Cancelar";
import ButtonCadastrar from "../Buttons/Button_Cadastrar";
import {cadastrarCategoria, updateCategoria} from "../../services/categoriasService";

function Modal_Categorias(props) {
    const [nomecategoria, setNomeCategoria] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (props.show) {
            if (props.categoria) {
                setNomeCategoria(props.categoria.nome || '');
            } else {
                setNomeCategoria('');
            }
        } else {
            setNomeCategoria('');
            setError('');
            setSuccess('');
        }
    }, [props.categoria, props.show]);

    const handleNomeCategoriaChange = (event) => {
        setNomeCategoria(event.target.value);
    }

    const handleCadastrarCategoria = async () => {
        if (!nomecategoria.trim()) {
            setError('O nome da categoria não pode estar vazio.');
            return;
        }
        try {
            const categoriaData = {
                nome: nomecategoria,
            };

            if (props.categoria) {
                await handleUpdateCategoria(props.categoria.id, categoriaData);
            } else {
                await cadastrarCategoria(categoriaData);
            }
            setSuccess('Categoria salva com sucesso!');
            props.onHide();
            props.onSuccess('Categoria salva com sucesso!');
        } catch (error) {
            setSuccess('');
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Erro ao salvar categoria');
            }
        }
    };

    const handleUpdateCategoria = async (id, categoriaAtualizada) => {
        try {
            const data = await updateCategoria(id, categoriaAtualizada);
            props.onSuccess(data.message);
        } catch (error) {
            console.error('Erro ao atualizar a categoria:', error);
        }
    };

    return (
        <Modal {...props} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.categoria ? 'Editar Categoria' : 'Nova Categoria'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '20px' }}>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <h6 style={{ marginBottom: '10px' }}>Categoria</h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input
                        type="text"
                        value={nomecategoria}
                        onChange={handleNomeCategoriaChange}
                        placeholder="Nome"
                        className="input-field"
                        style={{ width: '100%', maxWidth: '300px', padding: '5px 10px' }}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar onClick={props.onHide}>Cancelar</ButtonCancelar>
                <ButtonCadastrar onClick={handleCadastrarCategoria}>
                    {props.categoria ? 'Atualizar' : 'Cadastrar'}
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default Modal_Categorias;
