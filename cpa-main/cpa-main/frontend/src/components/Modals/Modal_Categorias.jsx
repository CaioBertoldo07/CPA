import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import ButtonCancelar from "../Buttons/Button_Cancelar";
import ButtonCadastrar from "../Buttons/Button_Cadastrar";
import { useAdicionarCategoriaMutation, useEditCategoriaMutation } from "../../hooks/mutations/useCategoriaMutations";

function Modal_Categorias(props) {
    const [nomecategoria, setNomeCategoria] = useState('');
    const [error, setError] = useState('');

    const adicionarMutation = useAdicionarCategoriaMutation();
    const editarMutation = useEditCategoriaMutation();
    const loading = adicionarMutation.isPending || editarMutation.isPending;

    useEffect(() => {
        if (props.show) {
            setNomeCategoria(props.categoria?.nome || '');
        } else {
            setNomeCategoria('');
            setError('');
        }
    }, [props.categoria, props.show]);

    const handleNomeCategoriaChange = (event) => setNomeCategoria(event.target.value);

    const handleCadastrarCategoria = async () => {
        if (!nomecategoria.trim()) return setError('Nome não pode estar vazio.');
        setError('');

        const mutation = props.categoria ? editarMutation : adicionarMutation;
        const payload = props.categoria
            ? { id: props.categoria.id, categoria: { nome: nomecategoria } }
            : { nome: nomecategoria };

        mutation.mutate(payload, {
            onSuccess: (data) => {
                props.onHide();
                props.onSuccess?.(data?.message || 'Categoria salva!');
            },
            onError: (err) => setError(err.response?.data?.error || 'Erro ao salvar categoria.')
        });
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
                <h6 style={{ marginBottom: '10px' }}>Categoria</h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input
                        type="text"
                        value={nomecategoria}
                        onChange={handleNomeCategoriaChange}
                        placeholder="Nome"
                        className="input-field"
                        style={{ width: '100%', maxWidth: '300px', padding: '5px 10px' }}
                        disabled={loading}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar onClick={props.onHide} disabled={loading}>Cancelar</ButtonCancelar>
                <ButtonCadastrar onClick={handleCadastrarCategoria} disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                    {props.categoria ? 'Atualizar' : 'Cadastrar'}
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default Modal_Categorias;
