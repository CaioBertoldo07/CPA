import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import DynamicInputs from '../utils/Dinamico_PadraoResposta';
import { cadastrarPadraoResposta } from '../../services/padraoRespostaService';
import { cadastrarAlternativa, editarAlternativa } from '../../services/alternativasServices';

function ModalUpdateAlternativa({ show, handleClose, paraoNumero, onSuccess, alternativa }) {
  const [alternativas, setAlternativas] = useState([{ descricao: '' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [descricao, setDescricao] = useState('');
  useEffect(() => {
    if (alternativa && alternativa.descricao) {
      setDescricao(alternativa.descricao);
    }
  }, [alternativa]);// Dependência em `alternativa`

  // useEffect(() => {
  //   if (props.data) {
  //     setAlternativas(props.data.alternativas);
  //   }
  // }, [props.data]);

  const handleSave = async () => {
    if (!alternativa.id) {
      console.error("ID da alternativa não definido.");
      return;
    }
    try {
      const updatedAlternativa = {
        ...alternativa,
        descricao: descricao,
      };
      console.log("Atualizando alternativa com ID:", alternativa.id); // Log para debug
      await editarAlternativa(alternativa.id, updatedAlternativa); // Chamada de função de atualização com o ID
      onSuccess("Alternativa atualizada com sucesso!"); // Passa apenas uma string de sucesso, não o objeto
      handleClose(); // Fecha o modal após salvar
    } catch (error) {
      console.error("Erro ao atualizar modalidade:", error);
    }
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
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={{
            border: '1px solid',
            borderRadius: '4px',
            padding: '8px',
            boxSizing: 'border-box',
            margin: '5px 0'
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar >Cancelar</ButtonCancelar>
        <ButtonCadastrar onClick={handleSave} >Salvar</ButtonCadastrar>
      </Modal.Footer>
    </Modal>
  );
}
export default ModalUpdateAlternativa;