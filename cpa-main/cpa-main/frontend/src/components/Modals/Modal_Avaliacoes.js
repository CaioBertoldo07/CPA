import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Row, Col, Form, Button } from 'react-bootstrap';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import './Modal_Avaliacao.css';
import { createAvaliacao } from '../../services/avaliacoesService';
import { CategoryCheckboxes } from "../utils/Check_boxes";
import { getModalidades } from '../../services/modalidadesService';
import { getMunicipios } from '../../services/municipiosService';
import { getUnidadesByMunicipios } from '../../services/unidadesService';
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import CursoSelectionModal from './CursoSelectionModal';
import QuestaoSelectionModal from './QuestaoSelectionModal';

function Modal_Avaliacoes(props) {
  const [ano, setAno] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [municipios, setMunicipios] = useState([]);
  const [municipiosVinculo, setMunicipiosVinculo] = useState([]);
  const [municipioSede, setMunicipioSede] = useState('');
  const [unidades, setUnidades] = useState([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState([]);
  // Estado para exibição (texto) e armazenamento dos cursos selecionados
  const [curso, setCurso] = useState('');
  const [cursosSelecionados, setCursosSelecionados] = useState([]);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [showQuestaoModal, setShowQuestaoModal] = useState(false);

  useEffect(() => {
    const fetchMunicipios = async () => {
      try {
        const municipiosData = await getMunicipios();
        const municipioOptions = municipiosData.map((municipio) => ({
          value: municipio.id,
          label: `${municipio.nome} - ${municipio.UF}`
        }));
        setMunicipios(municipioOptions);
      } catch (error) {
        console.error("Erro ao carregar municípios:", error);
        setError("Erro ao carregar municípios");
      }
    };
    fetchMunicipios();
  }, []);

  useEffect(() => {
    const fetchModalidades = async () => {
      try {
        const modalidadesData = await getModalidades();
        if (Array.isArray(modalidadesData)) {
          const modalidadeOptions = modalidadesData.map((modalidade) => ({
            value: modalidade.id,
            label: modalidade.mod_ensino,
          }));
          setModalidades(modalidadeOptions);
        } else {
          console.error("Formato inesperado de modalidades");
        }
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
      }
    };
    fetchModalidades();
  }, []);

  useEffect(() => {
    const fetchUnidades = async () => {
      if (municipiosVinculo.length > 0) {
        try {
          const selectedMunicipiosNomes = municipiosVinculo.map((m) => m.label.split(" - ")[0]);
          const unidadesData = await getUnidadesByMunicipios(selectedMunicipiosNomes);
          const unidadesOptions = unidadesData.map((unidade) => ({
            value: unidade.id,
            label: `${unidade.nome} - ${unidade.sigla}`
          }));
          setUnidades(unidadesOptions);
        } catch (error) {
          console.error("Erro ao carregar unidades:", error);
          setError("Erro ao carregar unidades");
        }
      } else {
        setUnidades([]);
      }
    };
    fetchUnidades();
  }, [municipiosVinculo]);

  const handleCategoriaChange = (event) => {
    const { id } = event.target;
    setCategorias((prevCategorias) => ({
      ...prevCategorias,
      [id]: !prevCategorias[id],
    }));
  };

  // Atualização da função de seleção de curso
  const handleCursoSelect = (selectedCursos) => {
    setCursosSelecionados(selectedCursos);
    setCurso(selectedCursos.map(c => c.nome).join(', '));
    setShowCursoModal(false);
  };

  const handleQuestoesSelect = (selectedQuestoes) => {
    setQuestoesSelecionadas(selectedQuestoes);
    setShowQuestaoModal(false);
  };

  const handleAdicionarCursoClick = () => {
    setShowCursoModal(true);
  };

  const handleAdicionarQuestaoClick = () => {
    setShowQuestaoModal(true);
  };

  const salvarAvaliacao = async () => {
    if (!ano || !periodo || !startDate || !endDate || !unidadeSelecionada) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setError('');
    setSuccess('');

    const avaliacaoData = {
      unidade: unidadeSelecionada.map(q => q.value),
      cursos: cursosSelecionados.map(c => c.value),
      categorias: Object.keys(categorias)
        .filter(id => categorias[id])
        .map(id => parseInt(id, 10)),
      modalidade: modalidadeSelecionada.map(q => q.value),
      questoes: questoesSelecionadas, // Envia o array de IDs diretamente
      periodo_letivo: ano + '.' + periodo,
      data_inicio: startDate,
      data_fim: endDate,
      status: 1,
      ano: ano,
    };

    try {
      console.log("Dados da Avaliação:", avaliacaoData);
      await createAvaliacao(avaliacaoData);
      setSuccess('Avaliação criada com sucesso!');
      props.onClose(); // Fecha o modal
    } catch (error) {
      setError('Erro ao criar avaliação. Verifique os dados e tente novamente.');
    }
  };

  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Nova avaliação
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <Row>
          <Col md={6}>
            <Form.Group controlId="anoPeriodo">
              <Form.Label>Período letivo:</Form.Label>
              <div className="d-flex justify-content-between">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Ano"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                />
                <select
                  className="form-control"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  <option value="" disabled hidden>Período</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="inicio">
              <Form.Label>Início:</Form.Label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="fim">
              <Form.Label>Fim:</Form.Label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group controlId="municipiosVinculo">
              <Form.Label>Municípios vínculo:</Form.Label>
              <AnimatedMultiSelect
                options={municipios}
                onChange={(selectedOptions) => setMunicipiosVinculo(selectedOptions)}
                placeholder="Selecione os municípios"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="unidade">
              <Form.Label>Unidade:</Form.Label>
              <AnimatedMultiSelect
                options={unidades}
                onChange={(selectedOptions) => setUnidadeSelecionada(selectedOptions)}
                placeholder="Selecione a unidade"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group controlId="municipioSede">
              <Form.Label>Município sede:</Form.Label>
              <Form.Control
                as="select"
                value={municipioSede}
                onChange={(e) => setMunicipioSede(e.target.value)}
              >
                <option value="" disabled hidden>Selecione o município</option>
                {municipios.map((municipio) => (
                  <option key={municipio.value} value={municipio.value}>
                    {municipio.label}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="modalidades">
              <Form.Label>Modalidades:</Form.Label>
              <AnimatedMultiSelect
                options={modalidades}
                onChange={(selectedOptions) => setModalidadeSelecionada(selectedOptions)}
                placeholder="Selecione as modalidades"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group controlId="curso">
              <Form.Label>Curso:</Form.Label>
              <Form.Control
                type="text"
                value={curso}
                readOnly
                placeholder="Selecione um curso"
              />
              <div className="text-end" style={{ marginTop: '8px' }}>
                <Button
                  onClick={handleAdicionarCursoClick}
                  style={{
                    backgroundColor: '#1d6b2f',
                    borderColor: '#28a745',
                    color: '#fff',
                  }}
                >
                  Adicionar Curso
                </Button>
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="categoria">
              <Form.Label>Categoria:</Form.Label>
              <CategoryCheckboxes categorias={categorias} onChange={handleCategoriaChange} />
            </Form.Group>
          </Col>
        </Row>
        <div className="text-end" style={{ marginTop: '8px' }}>
          <Button
            variant="secondary"
            onClick={handleAdicionarQuestaoClick}
            style={{
              backgroundColor: '#1d6b2f',
              borderColor: '#28a745',
              color: '#fff',
            }}
            className="mt-3"
          >
            + Incluir Questões
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar onClick={props.onHide}>Cancelar</ButtonCancelar>
        <ButtonCadastrar onClick={salvarAvaliacao}>Salvar avaliação</ButtonCadastrar>
      </Modal.Footer>

      {/* Modal de seleção de curso */}
      {showCursoModal && (
        <CursoSelectionModal
          show={showCursoModal}
          onHide={() => setShowCursoModal(false)}
          onCursosSelected={handleCursoSelect}
          unidadesSelecionadas={unidadeSelecionada}
        />
      )}

      {/* Modal de seleção de questões */}
      {showQuestaoModal && (
        <QuestaoSelectionModal
          show={showQuestaoModal}
          onHide={() => setShowQuestaoModal(false)}
          onQuestoesSelected={handleQuestoesSelect}
        />
      )}
    </Modal>
  );
}

export default Modal_Avaliacoes;
