import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import DynamicInputs from '../utils/Inputs_Dinamico';
import { cadastrarEixo } from '../../services/eixosService';
// import './modalStyles.css'; // Importe o arquivo CSS

function Modal_Eixos(props) {
  const [eixoNome, setEixoNome] = useState('');
  const [numeroEixo, setNumeroEixo] = useState('');
  const [dimensoes, setDimensoes] = useState([{ numero: '', nome: '' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (props.data) {
      setEixoNome(props.data.eixo.eixo);
      setDimensoes(props.data.eixo.dimensoes);
    }
  }, [props.data]);

  const handleEixoChange = (event) => {
    setEixoNome(event.target.value);
  };

  const handleNumeroEixoChange = (event) => {
    setNumeroEixo(event.target.value);
  };

  const handleNumeroChange = (index, value) => {
    const updatedDimensoes = [...dimensoes];
    updatedDimensoes[index].numero = value;
    setDimensoes(updatedDimensoes);
  };

  const handleNomeChange = (index, value) => {
    const updatedDimensoes = [...dimensoes];
    updatedDimensoes[index].nome = value;
    setDimensoes(updatedDimensoes);
  };

  const addDimensaoField = () => {
    setDimensoes([...dimensoes, { numero: '', nome: '' }]);
  };

  const removeDimensaoField = (index) => {
    const updatedDimensoes = [...dimensoes];
    updatedDimensoes.splice(index, 1);
    setDimensoes(updatedDimensoes);
  };

  const handleCadastrarEixo = async () => {
    try {
      const eixoData = {
        numero: numeroEixo,
        nome: eixoNome,
        dimensoes: dimensoes.filter(d => d.numero !== '' || d.nome !== '')
      };
  
      const response = await cadastrarEixo(eixoData);
      setSuccess('Eixo cadastrado com sucesso!');
      setError('');
      props.onHide();
      props.onSuccess('Eixo cadastrado com sucesso!'); // Atualiza a tabela após o sucesso
    } catch (error) {
      console.error('Erro ao cadastrar eixo:', error);
      setSuccess('');
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Erro ao cadastrar eixo');
      }
    }
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
        {success && <div className="alert alert-success">{success}</div>}

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
        <ButtonCancelar onClick={props.onHide}>Cancelar</ButtonCancelar>
        <ButtonCadastrar onClick={handleCadastrarEixo}>Cadastrar</ButtonCadastrar>
      </Modal.Footer>
    </Modal>
  );
}

export default Modal_Eixos;