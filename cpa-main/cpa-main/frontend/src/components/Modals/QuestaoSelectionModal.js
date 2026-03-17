import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { getQuestoes } from '../../services/questoesService';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';

function QuestaoSelectionModal({ show, onHide, onQuestoesSelected }) {
    const [questoes, setQuestoes] = useState([]);
    const [dimensaoSelecionada, setDimensaoSelecionada] = useState('');
    const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
    const [dimensoes, setDimensoes] = useState([]);

    useEffect(() => {
        const fetchQuestoes = async () => {
            try {
                const questoesData = await getQuestoes();
                setQuestoes(questoesData);
                const dimensoesUnicas = [...new Set(questoesData.map(questao => questao.dimensao_nome))];
                setDimensoes(dimensoesUnicas);
            } catch (error) {
                console.error("Erro ao carregar questões:", error);
            }
        };

        if (show) {
            fetchQuestoes();
        }
    }, [show]);

    const filteredQuestoes = dimensaoSelecionada
        ? questoes.filter((questao) => questao.dimensao_nome === dimensaoSelecionada)
        : questoes;

    const handleQuestaoToggle = (questaoId) => {
        setQuestoesSelecionadas((prevSelecionadas) =>
            prevSelecionadas.includes(questaoId)
                ? prevSelecionadas.filter((id) => id !== questaoId)
                : [...prevSelecionadas, questaoId]
        );
    };

    const handleDimensaoChange = (e) => {
        setDimensaoSelecionada(e.target.value);
    };

    const handleConfirmSelection = () => {
        onQuestoesSelected(questoesSelecionadas);
        onHide();
    };

    const groupedQuestoesByEixoAndDimensao = filteredQuestoes.reduce((acc, questao) => {
        if (!acc[questao.eixo_nome]) {
            acc[questao.eixo_nome] = {};
        }
        if (!acc[questao.eixo_nome][questao.dimensao_nome]) {
            acc[questao.eixo_nome][questao.dimensao_nome] = { numero: questao.numero_dimensoes, questoes: [] };
        }
        acc[questao.eixo_nome][questao.dimensao_nome].questoes.push(questao);
        return acc;
    }, {});

    return (
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="questao-selection-modal" centered>
            <Modal.Header closeButton>
                <Modal.Title id="questao-selection-modal">Selecionar Questões</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="dimensaoSelect">
                                <Form.Label>Selecione a Dimensão</Form.Label>
                                <Form.Control as="select" value={dimensaoSelecionada} onChange={handleDimensaoChange}>
                                    <option value="">Todas</option>
                                    {dimensoes.map((dimensao, index) => (
                                        <option key={index} value={dimensao}>{dimensao}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        {Object.keys(groupedQuestoesByEixoAndDimensao).length === 0 ? (
                            <Col md={12}>
                                <p>Nenhuma questão encontrada para essa dimensão.</p>
                            </Col>
                        ) : (
                            Object.keys(groupedQuestoesByEixoAndDimensao).map((eixo) => {
                                let questaoCount = 1;
                                return (
                                    <Col style={{ marginBottom: '20px' }} md={12} key={eixo}>
                                        <Row>
                                            <h4>
                                                {groupedQuestoesByEixoAndDimensao[eixo][
                                                    Object.keys(groupedQuestoesByEixoAndDimensao[eixo])[0]
                                                ].questoes[0].eixo_numero}{' '}
                                                - {eixo}
                                            </h4>
                                        </Row>
                                        {Object.keys(groupedQuestoesByEixoAndDimensao[eixo]).map((dimensao) => (
                                            <div key={dimensao} style={{ marginLeft: '20px' }}>
                                                <h5 style={{ marginLeft: '20px' }}>
                                                    {
                                                        groupedQuestoesByEixoAndDimensao[eixo][dimensao].questoes[0].dimensao_numero
                                                    }{' '}
                                                    - {dimensao}
                                                </h5>
                                                {groupedQuestoesByEixoAndDimensao[eixo][dimensao].questoes.map((questao) => (
                                                    <Col key={questao.id} md={12} style={{ marginLeft: '40px' }}>
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
                                                                        marginBottom: '10px',
                                                                        display: 'block',
                                                                    }}
                                                                >
                                                                    {`Questão ${questaoCount++} - ${questao.descricao}`}
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
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar variant="secondary" onClick={onHide}>
                    Cancelar
                </ButtonCancelar>
                <ButtonCadastrar variant="primary" onClick={handleConfirmSelection}>
                    Confirmar Seleção
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default QuestaoSelectionModal;
