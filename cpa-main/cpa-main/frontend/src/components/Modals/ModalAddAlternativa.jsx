import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import DynamicInputs from '../utils/Dinamico_PadraoResposta';
import { cadastrarPadraoResposta } from '../../services/padraoRespostaService';
import { cadastrarAlternativa } from '../../services/alternativasServices';

function ModalAddAlternativa({ show, handleClose, paraoNumero, onSuccess }) {
  const [alternativas, setAlternativas] = useState([{ descricao: '' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [descricao, setDescricao] = useState('');

  // useEffect(() => {
  //   if (props.data) {
  //     setAlternativas(props.data.alternativas);
  //   }
  // }, [props.data]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const alternativa of alternativas) {
        if (alternativa.descricao) {  // Evita enviar alternativas vazias
          const newAlternativa = { descricao: alternativa.descricao, id_padrao_resp: paraoNumero };
          await cadastrarAlternativa(newAlternativa);
        }
      }
      onSuccess('Alternativas adicionadas com sucesso');
      handleClose();
    } catch (error) {
      console.error('Erro ao adicionar alternativas:', error);
      setError('Erro ao adicionar alternativas.');
    }
  };
  const handleAlternativaChange = (index,value) => {
    const updatedAlternativas = [...alternativas];
    updatedAlternativas[index].descricao = value;
    setAlternativas(updatedAlternativas);
  }; 

  const addAlternativaField = () => {
    setAlternativas([...alternativas, { descricao: ''}]);
  };

  const removeAlternativaField = (index) => {
    const updatedAlternativas = [...alternativas];
    updatedAlternativas.splice(index, 1);
    setAlternativas(updatedAlternativas);
  };


  

  return (
    <Modal show={show} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Nova Alternativa
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <h6>Alternativas</h6>
        <DynamicInputs
          inputs={alternativas}
          adicionarInput={addAlternativaField}
          removerInput={removeAlternativaField}
          handlePadraoChange={handleAlternativaChange} // Usado para o texto da alternativa
        />
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar >Cancelar</ButtonCancelar>
        <ButtonCadastrar onClick={handleSubmit} >Cadastrar</ButtonCadastrar>
      </Modal.Footer>
    </Modal>
  );
}
export default ModalAddAlternativa;