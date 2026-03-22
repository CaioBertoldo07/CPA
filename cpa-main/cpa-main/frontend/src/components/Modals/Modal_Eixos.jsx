import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import DynamicInputs from '../utils/Inputs_Dinamico';
import { useAdicionarEixoMutation } from '../../hooks/mutations/useEixoMutations';

function Modal_Eixos(props) {
  const [eixoNome, setEixoNome] = useState('');
  const [numeroEixo, setNumeroEixo] = useState('');
  const [dimensoes, setDimensoes] = useState([{ numero: '', nome: '' }]);
  const [error, setError] = useState('');

  const adicionarEixoMutation = useAdicionarEixoMutation();

  useEffect(() => {
    if (props.show) {
      setEixoNome('');
      setNumeroEixo('');
      setDimensoes([{ numero: '', nome: '' }]);
      setError('');
    }
  }, [props.show]);

  const handleEixoChange = (e) => setEixoNome(e.target.value);
  const handleNumeroEixoChange = (e) => setNumeroEixo(e.target.value);

  const addDimensaoField = () => setDimensoes([...dimensoes, { numero: '', nome: '' }]);
  const removeDimensaoField = (index) => setDimensoes(dimensoes.filter((_, i) => i !== index));

  const handleNumeroChange = (index, value) => {
    const newDimensoes = [...dimensoes];
    newDimensoes[index].numero = value;
    setDimensoes(newDimensoes);
  };

  const handleNomeChange = (index, value) => {
    const newDimensoes = [...dimensoes];
    newDimensoes[index].nome = value;
    setDimensoes(newDimensoes);
  };

  const handleCadastrarEixo = () => {
    if (!eixoNome || !numeroEixo) return setError('Preencha os campos do Eixo.');
    setError('');

    adicionarEixoMutation.mutate({ nome: eixoNome, numero: numeroEixo, dimensoes }, {
      onSuccess: () => {
        props.onHide();
        if (props.onSuccess) props.onSuccess('Eixo cadastrado com sucesso!');
      },
      onError: (err) => setError(err?.response?.data?.error || 'Erro ao cadastrar eixo.')
    });
  };


  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Novo Eixo
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <h6>Eixo</h6>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <input
            type="text"
            value={numeroEixo}
            onChange={handleNumeroEixoChange}
            placeholder="Número"
            className="input-field"
            style={{ width: '80px' }}
          />
          <input
            type="text"
            value={eixoNome}
            onChange={handleEixoChange}
            placeholder="Nome"
            className="input-field"
            style={{ width: '200px' }}
          />
        </div>

        <h6 style={{ marginTop: '20px' }}>Dimensões</h6>
        <DynamicInputs
          inputs={dimensoes}
          adicionarInput={addDimensaoField}
          removerInput={removeDimensaoField}
          handleNumeroChange={handleNumeroChange}
          handleNomeChange={handleNomeChange}
        />
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar onClick={props.onHide} disabled={adicionarEixoMutation.isPending}>
          Cancelar
        </ButtonCancelar>
        <ButtonCadastrar onClick={handleCadastrarEixo} disabled={adicionarEixoMutation.isPending}>
          {adicionarEixoMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
        </ButtonCadastrar>
      </Modal.Footer>
    </Modal>
  );
}

export default Modal_Eixos;