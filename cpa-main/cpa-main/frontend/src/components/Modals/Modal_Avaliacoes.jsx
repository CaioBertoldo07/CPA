import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Spinner, Button } from 'react-bootstrap';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import { useAdicionarAvaliacaoMutation } from '../../hooks/mutations/useAvaliacaoMutations';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useGetMunicipiosQuery } from '../../hooks/queries/useMunicipioQueries';
import { useGetUnidadesByMunicipiosQuery } from '../../hooks/queries/useUnidadeQueries';
import { CategoryCheckboxes } from "../utils/Check_boxes";
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import CursoSelectionModal from './CursoSelectionModal';
import QuestaoSelectionModal from './QuestaoSelectionModal';

function Modal_Avaliacoes(props) {
    const [ano, setAno] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [municipiosVinculo, setMunicipiosVinculo] = useState([]);
    const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);
    const [categorias, setCategorias] = useState({});
    const [modalidadeSelecionada, setModalidadeSelecionada] = useState([]);
    const [curso, setCurso] = useState('');
    const [cursosSelecionados, setCursosSelecionados] = useState([]);
    const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
    const [error, setError] = useState('');
    const [showCursoModal, setShowCursoModal] = useState(false);
    const [showQuestaoModal, setShowQuestaoModal] = useState(false);

    const { data: municipiosData = [] } = useGetMunicipiosQuery();
    const { data: modalidadesData = [] } = useGetModalidadesQuery();

    const municipiosNomes = municipiosVinculo.map(m => m.label.split(' - ')[0]);
    const { data: unidadesData = [] } = useGetUnidadesByMunicipiosQuery(municipiosNomes);

    const adicionarAvaliacaoMutation = useAdicionarAvaliacaoMutation();
    const loading = adicionarAvaliacaoMutation.isPending;

    const municipios = municipiosData.map(m => ({ value: m.id, label: `${m.nome} - ${m.UF}` }));
    const modalidades = modalidadesData.map(m => ({ value: m.id, label: m.mod_ensino }));
    const unidades = unidadesData.map(u => ({ value: u.id, label: `${u.nome} - ${u.sigla}` }));

    useEffect(() => {
        if (!props.show) {
            setAno(''); setPeriodo('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate(new Date().toISOString().split('T')[0]);
            setMunicipiosVinculo([]); setUnidadeSelecionada(null);
            setCategorias({}); setModalidadeSelecionada([]);
            setCurso(''); setCursosSelecionados([]);
            setQuestoesSelecionadas([]); setError('');
        }
    }, [props.show]);

    const handleCategoriaChange = (event) => {
        const { id } = event.target;
        setCategorias(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCursoSelect = (selected) => {
        setCursosSelecionados(selected);
        setCurso(selected.map(c => c.nome).join(', '));
        setShowCursoModal(false);
    };

    const handleQuestoesSelect = (selected) => {
        setQuestoesSelecionadas(selected);
        setShowQuestaoModal(false);
    };

    const salvarAvaliacao = async () => {
        if (!ano || !periodo) return setError('Preencha o período letivo.');
        if (!startDate || !endDate) return setError('Preencha as datas.');
        if (!unidadeSelecionada?.length) return setError('Selecione uma unidade.');
        if (!cursosSelecionados.length) return setError('Selecione um curso.');
        if (!questoesSelecionadas.length) return setError('Selecione uma questão.');

        setError('');

        const avaliacaoData = {
            unidade: unidadeSelecionada.map(q => q.value),
            cursos: cursosSelecionados.map(c => c.value ?? c.identificador_api_lyceum),
            categorias: Object.keys(categorias).filter(id => categorias[id]).map(id => parseInt(id, 10)),
            modalidade: modalidadeSelecionada.map(q => q.value),
            questoes: questoesSelecionadas,
            periodo_letivo: `${ano}.${periodo}`,
            data_inicio: startDate,
            data_fim: endDate,
            status: 1,
            ano,
        };

        adicionarAvaliacaoMutation.mutate(avaliacaoData, {
            onSuccess: () => props.onClose?.(),
            onError: (err) => setError(err?.response?.data?.error || 'Erro ao criar avaliação.')
        });
    };

    return (
        <Modal {...props} size="lg" aria-labelledby="modal-avaliacao-title" centered>
            <Modal.Header closeButton>
                <Modal.Title id="modal-avaliacao-title">Nova avaliação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}

                <Row>
                    <Col md={6}>
                        <Form.Group controlId="anoPeriodo">
                            <Form.Label>Período letivo: <span style={{ color: 'red' }}>*</span></Form.Label>
                            <div className="d-flex justify-content-between">
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    placeholder="Ano (ex: 2024)"
                                    value={ano}
                                    onChange={e => setAno(e.target.value)}
                                />
                                <select
                                    className="form-control"
                                    value={periodo}
                                    onChange={e => setPeriodo(e.target.value)}
                                >
                                    <option value="" disabled hidden>Semestre</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                </select>
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="inicio">
                            <Form.Label>Início:</Form.Label>
                            <input type="date" className="form-control" value={startDate}
                                onChange={e => setStartDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="fim">
                            <Form.Label>Fim:</Form.Label>
                            <input type="date" className="form-control" value={endDate}
                                onChange={e => setEndDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Municípios vínculo:</Form.Label>
                            <AnimatedMultiSelect
                                options={municipios}
                                onChange={setMunicipiosVinculo}
                                placeholder="Selecione os municípios"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Unidade: <span style={{ color: 'red' }}>*</span></Form.Label>
                            <AnimatedMultiSelect
                                options={unidades}
                                onChange={setUnidadeSelecionada}
                                placeholder={municipiosVinculo.length === 0
                                    ? 'Selecione um município primeiro'
                                    : 'Selecione a unidade'}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Modalidades:</Form.Label>
                            <AnimatedMultiSelect
                                options={modalidades}
                                onChange={setModalidadeSelecionada}
                                placeholder="Selecione as modalidades"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Categoria:</Form.Label>
                            <CategoryCheckboxes categorias={categorias} onChange={handleCategoriaChange} />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>
                                Cursos: <span style={{ color: 'red' }}>*</span>
                                {cursosSelecionados.length > 0 && (
                                    <span className="badge bg-success ms-2">
                                        {cursosSelecionados.length} selecionado(s)
                                    </span>
                                )}
                            </Form.Label>
                            <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                    type="text"
                                    value={curso}
                                    readOnly
                                    placeholder="Clique em 'Adicionar Curso' para selecionar"
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    onClick={() => setShowCursoModal(true)}
                                    disabled={!unidadeSelecionada || unidadeSelecionada.length === 0}
                                    style={{ backgroundColor: '#1d6b2f', borderColor: '#28a745', color: '#fff', whiteSpace: 'nowrap' }}
                                >
                                    Adicionar Curso
                                </Button>
                            </div>
                            {(!unidadeSelecionada || unidadeSelecionada.length === 0) && (
                                <small className="text-muted">Selecione uma unidade para ver os cursos disponíveis.</small>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                <div className="text-end mt-3">
                    <Button
                        onClick={() => setShowQuestaoModal(true)}
                        style={{ backgroundColor: '#1d6b2f', borderColor: '#28a745', color: '#fff' }}
                    >
                        + Incluir Questões
                        {questoesSelecionadas.length > 0 && (
                            <span className="badge bg-light text-dark ms-2">
                                {questoesSelecionadas.length}
                            </span>
                        )}
                    </Button>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <ButtonCancelar onClick={props.onHide} disabled={loading}>Cancelar</ButtonCancelar>
                <ButtonCadastrar onClick={salvarAvaliacao} disabled={loading}>
                    {loading
                        ? <><Spinner size="sm" animation="border" className="me-2" />Salvando...</>
                        : 'Salvar avaliação'
                    }
                </ButtonCadastrar>
            </Modal.Footer>

            {showCursoModal && (
                <CursoSelectionModal
                    show={showCursoModal}
                    onHide={() => setShowCursoModal(false)}
                    onCursosSelected={handleCursoSelect}
                    unidadesSelecionadas={unidadeSelecionada}
                />
            )}

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