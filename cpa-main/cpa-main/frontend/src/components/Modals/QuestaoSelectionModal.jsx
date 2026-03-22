// src/components/Modals/QuestaoSelectionModal.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import { useGetQuestoesQuery } from '../../hooks/queries/useQuestaoQueries';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';

function QuestaoSelectionModal({ show, onHide, onQuestoesSelected }) {
    const [dimensaoSelecionada, setDimensaoSelecionada] = useState('');
    const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);

    const {
        data: questoes = [],
        isLoading: loading,
        isError,
        error: queryError
    } = useGetQuestoesQuery();

    const dimensoes = Array.from(new Set(questoes
        .map(q => q?.dimensao?.nome)
        .filter(Boolean)
    )).sort();

    useEffect(() => {
        if (isError) {
            console.error("Erro ao carregar questões:", queryError);
        }
    }, [isError, queryError]);

    // Ao fechar, reseta seleções
    const handleClose = () => {
        setDimensaoSelecionada('');
        setQuestoesSelecionadas([]);
        onHide();
    };

    // ── filtro ─────────────────────────────────────
    const filteredQuestoes = dimensaoSelecionada
        ? questoes.filter(q => q?.dimensao?.nome === dimensaoSelecionada)
        : questoes;

    const handleQuestaoToggle = (questaoId) => {
        setQuestoesSelecionadas(prev =>
            prev.includes(questaoId)
                ? prev.filter(id => id !== questaoId)
                : [...prev, questaoId]
        );
    };

    const handleSelectAll = () => {
        const allIds = filteredQuestoes.map(q => q.id);
        const allSelected = allIds.every(id => questoesSelecionadas.includes(id));
        if (allSelected) {
            setQuestoesSelecionadas(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setQuestoesSelecionadas(prev => {
                const newSet = new Set([...prev, ...allIds]);
                return Array.from(newSet);
            });
        }
    };

    const handleConfirmSelection = () => {
        onQuestoesSelected(questoesSelecionadas);
        handleClose();
    };

    // ── agrupamento por eixo → dimensão ────────────
    const groupedQuestoes = filteredQuestoes.reduce((acc, questao) => {
        // Acesso seguro
        const eixoNome = questao?.dimensao?.eixo?.nome || 'Sem eixo';
        const eixoNumero = questao?.dimensao?.eixo?.numero ?? '';
        const dimensaoNome = questao?.dimensao?.nome || 'Sem dimensão';
        const dimensaoNumero = questao?.dimensao?.numero ?? '';

        const eixoKey = `${eixoNumero} - ${eixoNome}`;
        const dimensaoKey = `${dimensaoNumero} - ${dimensaoNome}`;

        if (!acc[eixoKey]) {
            acc[eixoKey] = {};
        }
        if (!acc[eixoKey][dimensaoKey]) {
            acc[eixoKey][dimensaoKey] = [];
        }
        acc[eixoKey][dimensaoKey].push(questao);
        return acc;
    }, {});

    const allFilteredIds = filteredQuestoes.map(q => q.id);
    const allFilteredSelected = allFilteredIds.length > 0 &&
        allFilteredIds.every(id => questoesSelecionadas.includes(id));

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            aria-labelledby="questao-selection-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="questao-selection-modal">
                    Selecionar Questões
                    {questoesSelecionadas.length > 0 && (
                        <span
                            className="badge bg-success ms-2"
                            style={{ fontSize: '0.75rem' }}
                        >
                            {questoesSelecionadas.length} selecionada(s)
                        </span>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="success" />
                        <p className="mt-2 text-muted">Carregando questões...</p>
                    </div>
                ) : (
                    <Form>
                        {/* Filtro por dimensão */}
                        <Row className="mb-3">
                            <Col md={8}>
                                <Form.Group controlId="dimensaoSelect">
                                    <Form.Label>Filtrar por dimensão</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={dimensaoSelecionada}
                                        onChange={e => setDimensaoSelecionada(e.target.value)}
                                    >
                                        <option value="">Todas as dimensões</option>
                                        {dimensoes.map((d, i) => (
                                            <option key={i} value={d}>{d}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                                <Form.Check
                                    type="checkbox"
                                    id="select-all"
                                    label={allFilteredSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                                    checked={allFilteredSelected}
                                    onChange={handleSelectAll}
                                    disabled={filteredQuestoes.length === 0}
                                />
                            </Col>
                        </Row>

                        {/* Lista agrupada */}
                        <Row>
                            {Object.keys(groupedQuestoes).length === 0 ? (
                                <Col md={12}>
                                    <p className="text-muted text-center py-3">
                                        Nenhuma questão encontrada.
                                    </p>
                                </Col>
                            ) : (
                                Object.entries(groupedQuestoes).map(([eixoKey, dimensoesObj]) => {
                                    let questaoCount = 1;
                                    return (
                                        <Col md={12} key={eixoKey} style={{ marginBottom: '20px' }}>
                                            <h5 className="text-success">{eixoKey}</h5>
                                            {Object.entries(dimensoesObj).map(([dimKey, questoes]) => (
                                                <div key={dimKey} style={{ marginLeft: '15px' }}>
                                                    <h6 className="text-muted mt-2">{dimKey}</h6>
                                                    {questoes.map((questao) => (
                                                        <Col
                                                            key={questao.id}
                                                            md={12}
                                                            style={{ marginLeft: '20px' }}
                                                        >
                                                            <Form.Check
                                                                type="checkbox"
                                                                id={`questao-${questao.id}`}
                                                                label={
                                                                    <span
                                                                        style={{
                                                                            wordWrap: 'break-word',
                                                                            whiteSpace: 'normal',
                                                                            lineHeight: '1.5',
                                                                            fontSize: '14px',
                                                                            marginBottom: '8px',
                                                                            display: 'block',
                                                                        }}
                                                                    >
                                                                        {`Q${questaoCount++} — ${questao.descricao}`}
                                                                    </span>
                                                                }
                                                                checked={questoesSelecionadas.includes(questao.id)}
                                                                onChange={() => handleQuestaoToggle(questao.id)}
                                                            />
                                                        </Col>
                                                    ))}
                                                </div>
                                            ))}
                                        </Col>
                                    );
                                })
                            )}
                        </Row>
                    </Form>
                )}
            </Modal.Body>

            <Modal.Footer>
                <ButtonCancelar onClick={handleClose}>
                    Cancelar
                </ButtonCancelar>
                <ButtonCadastrar
                    onClick={handleConfirmSelection}
                    disabled={questoesSelecionadas.length === 0}
                >
                    Confirmar Seleção ({questoesSelecionadas.length})
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default QuestaoSelectionModal;