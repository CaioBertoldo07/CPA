import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import Dinamico_PadraoResposta from '../utils/Dinamico_PadraoResposta';
import { useAdicionarAlternativaMutation } from '../../hooks/mutations/useAlternativaMutations';

function ModalAddAlternativa({ show, handleClose, paraoNumero, onSuccess }) {
  const [alternativas, setAlternativas] = useState([{ descricao: '' }]);
  const [error, setError] = useState('');

  const adicionarMutation = useAdicionarAlternativaMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validAlternativas = alternativas.filter(a => a.descricao && a.descricao.trim());

      for (const alternativa of validAlternativas) {
        const newAlternativa = { descricao: alternativa.descricao, id_padrao_resp: paraoNumero };
        await adicionarMutation.mutateAsync(newAlternativa);
      }

      onSuccess('Alternativas adicionadas com sucesso');
      setAlternativas([{ descricao: '' }]);
      handleClose();
    } catch (error) {
      setError('Erro ao adicionar alternativas.');
    }
  };

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




  return (
    <Modal show={show} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Nova Alternativa
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <h6>Alternativas</h6>
        <Dinamico_PadraoResposta
          inputs={alternativas}
          adicionarInput={addAlternativaField}
          removerInput={removeAlternativaField}
          handlePadraoChange={handleAlternativaChange} // Usado para o texto da alternativa
        />
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar onClick={handleClose} disabled={adicionarMutation.isPending}>Cancelar</ButtonCancelar>
        <ButtonCadastrar onClick={handleSubmit} disabled={adicionarMutation.isPending}>
          {adicionarMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
        </ButtonCadastrar>
      </Modal.Footer>
    </Modal>
  );
}
export default ModalAddAlternativa;