import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import DynamicInputs from '../utils/Dinamico_PadraoResposta';
import { cadastrarPadraoResposta } from '../../services/padraoRespostaService';
import { cadastrarAlternativa } from '../../services/alternativasServices';

function ModalAddPadraoResposta(props) {
  // const [id, setId] = useState('');
  const [sigla, setSigla] = useState('');
  const [alternativas, setAlternativas] = useState([{ descricao: '' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (props.data) {
      setSigla(props.data.sigla);
      setAlternativas(props.data.alternativas);
    }
  }, [props.data]);

  const handleSiglaChange = (event) => {
    setSigla(event.target.value);
  };
  // const handleIdChange = (event) => {
  //   setId(event.target.value);
  // };
  const handleAlternativaChange = (index, value) => {
    const updatedAlternativas = [...alternativas];
    updatedAlternativas[index].descricao = value;
    setAlternativas(updatedAlternativas);
  };

  const addAlternativaField = () => {
    setAlternativas([...alternativas, { descricao: '' }]);
  };

  const removeAlternativaField = (index) => {
    const updatedAlternativas = [...alternativas];
    updatedAlternativas.splice(index, 1);
    setAlternativas(updatedAlternativas);
  };

  const handleCadastrarPadraoResposta = async () => {
    try {
      const padraoRespostaData = {
        sigla,
        alternativas: alternativas.filter(a => a.descricao && a.descricao.trim())  // Filtra alternativas válidas
      };

      const response = await cadastrarPadraoResposta(padraoRespostaData);

      setSuccess('Padrão de resposta cadastrado com sucesso!');
      setError('');
      props.onHide();
      props.onSuccess('Padrão de resposta cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar padrão de resposta:', error);
      setSuccess('');
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Erro ao cadastrar padrão de resposta.');
      }
    }
  };


  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Novo Padrão de Resposta
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <h6>Sigla</h6>
        <input
          type="text"
          value={sigla}
          onChange={handleSiglaChange}
          placeholder="Sigla"
          className="input-field"
          style={{ width: '200px', marginBottom: '10px' }}
        />

        <h6>Alternativas</h6>
        <DynamicInputs
          inputs={alternativas}
          adicionarInput={addAlternativaField}
          removerInput={removeAlternativaField}
          handlePadraoChange={handleAlternativaChange} // Usado para o texto da alternativa

        />
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar onClick={props.onHide}>Cancelar</ButtonCancelar>
        <ButtonCadastrar onClick={handleCadastrarPadraoResposta}>Cadastrar</ButtonCadastrar>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalAddPadraoResposta;