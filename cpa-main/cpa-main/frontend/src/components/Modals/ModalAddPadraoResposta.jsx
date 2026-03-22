import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import Dinamico_PadraoResposta from '../utils/Dinamico_PadraoResposta';
import { useAdicionarPadraoRespostaMutation } from '../../hooks/mutations/usePadraoRespostaMutations';

function ModalAddPadraoResposta(props) {
  const [sigla, setSigla] = useState('');
  const [alternativas, setAlternativas] = useState([{ descricao: '' }]);
  const [error, setError] = useState('');

  const adicionarMutation = useAdicionarPadraoRespostaMutation();

  useEffect(() => {
    if (props.data) {
      setSigla(props.data.sigla);
      setAlternativas(props.data.alternativas || [{ descricao: '' }]);
    }
  }, [props.data]);

  const handleSiglaChange = (event) => {
    setSigla(event.target.value);
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

  const handleCadastrarPadraoResposta = () => {
    const payload = {
      sigla,
      alternativas: alternativas.filter(a => a.descricao && a.descricao.trim())
    };

    adicionarMutation.mutate(payload, {
      onSuccess: () => {
        setError('');
        setSigla('');
        setAlternativas([{ descricao: '' }]);
        props.onHide();
        props.onSuccess('Padrão de resposta cadastrado com sucesso!');
      },
      onError: (err) => {
        setError(err.response?.data?.error || 'Erro ao cadastrar padrão de resposta.');
      }
    });
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
        <Dinamico_PadraoResposta
          inputs={alternativas}
          adicionarInput={addAlternativaField}
          removerInput={removeAlternativaField}
          handlePadraoChange={handleAlternativaChange} // Usado para o texto da alternativa
        />
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar onClick={props.onHide} disabled={adicionarMutation.isPending}>Cancelar</ButtonCancelar>
        <ButtonCadastrar onClick={handleCadastrarPadraoResposta} disabled={adicionarMutation.isPending}>
          {adicionarMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
        </ButtonCadastrar>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalAddPadraoResposta;