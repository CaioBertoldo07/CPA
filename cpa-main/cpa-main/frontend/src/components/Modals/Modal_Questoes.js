import React, { useEffect, useState } from 'react';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Modal from "react-bootstrap/Modal";
import "./Modal_Questoes.css";
import { getEixos } from "../../services/eixosService";
import { getModalidades } from '../../services/modalidadesService';
import { ToggleSlider } from "react-toggle-slider";
import { CategoryCheckboxes } from "../utils/Check_boxes";
import { getPadraoResposta } from "../../services/padraoRespostaService";
import { getDimensoesByEixo } from "../../services/dimensoesService";
import { cadastrarQuestoes, updateQuestao } from "../../services/questoesService";
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import { getTiposQuestoes } from "../../services/tiposQuestaoService";

function Modal_Questoes(props) {
    const [dataeixo, setDataEixo] = useState([]);
    const [datapadraoresposta, setDataPadraoResposta] = useState([]);
    const [datadimensao, setDatadimensao] = useState([]);
    const [eixoSelecionado, setEixoSelecionado] = useState('');
    const [dimensaoSelecionada, setDimensaoSelecionada] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categorias, setCategorias] = useState({});
    const [modalidades, setModalidades] = useState([]);
    const [modalidadeSelecionada, setModalidadeSelecionada] = useState([]);
    const [basica, setBasica] = useState(false);
    const [questao, setQuestao] = useState('');
    const [padraorespostaselecionado, setPadraoRespostaselecionado] = useState('');
    const [tipoQuestao, setTipoQuestao] = useState('');
    const [tiposQuestoes, setTiposQuestoes] = useState([]);
    const [questoesAdicionais, setQuestoesAdicionais] = useState([]); // array de strings

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eixos, padraoresposta, tipos] = await Promise.all([
                    getEixos(),
                    getPadraoResposta(),
                    getTiposQuestoes(),
                ]);
                setDataEixo(eixos);
                setDataPadraoResposta(padraoresposta);
                setTiposQuestoes(tipos);
            } catch (error) {
                setError('Falha ao carregar os dados');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchModalidades = async () => {
            try {
                const modalidadesData = await getModalidades();
                if (Array.isArray(modalidadesData)) {
                    const modalidadeOptions = modalidadesData.map(modalidade => ({
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

    const resetFormState = () => {
        setQuestao('');
        setEixoSelecionado('');
        setDimensaoSelecionada('');
        setCategorias({});
        setModalidadeSelecionada([]);
        setBasica(false);
        setPadraoRespostaselecionado('');
        setTipoQuestao('');
        setError('');
        setSuccess('');
        setQuestoesAdicionais([]);
    };

    const handleQuestaoChange = (event) => {
        setQuestao(event.target.value);
    };

    const handleEixoSelect = async (event) => {
        const selectedValue = event.target.value;
        setEixoSelecionado(selectedValue);
        await fetchDimensoes(selectedValue);
    };

    const handleModalidadesChange = (selectedOptions) => {
        const selectedIds = selectedOptions.map(option => option.value);
        setModalidadeSelecionada(selectedIds);
    };

    const handleCategoriaChange = (event) => {
        const { id } = event.target;
        setCategorias((prevCategorias) => ({
            ...prevCategorias,
            [id]: !prevCategorias[id],
        }));
    };

    const fetchDimensoes = async (eixoNumero) => {
        try {
            const dimensoes = await getDimensoesByEixo(eixoNumero);
            setDatadimensao(dimensoes);
        } catch (erro) {
            setError('Failed to fetch dimensions');
        }
    };

    const handleBasica = (event) => {
        setBasica(event);
    };

    const handlePadraoRespostaSelect = (event) => {
        setPadraoRespostaselecionado(event.target.value);
    };

    const handleTipoQuestaoChange = (event) => {
        setTipoQuestao(event.target.value);
    };

    // Adiciona uma questão adicional (inicia com uma string vazia)
    const handleAdicionarQuestaoAdicional = () => {
        setQuestoesAdicionais([...questoesAdicionais, '']);
    };

    const handleQuestaoAdicionalChange = (index, event) => {
        const newArray = [...questoesAdicionais];
        newArray[index] = event.target.value;
        setQuestoesAdicionais(newArray);
    };

    const handleRemoverQuestaoAdicional = (index) => {
        const newArray = questoesAdicionais.filter((_, i) => i !== index);
        setQuestoesAdicionais(newArray);
    };

    const handleCadastrarQuestao = async () => {
        if (!questao.trim()) {
            setError('A questão não pode estar vazia.');
            return;
        }
        try {
            // Converte o array de strings para array de objetos
            const formattedQuestoesAdicionais = questoesAdicionais.map(item => ({ descricao: item }));

            const questaoData = {
                questao, // Descrição da questão principal
                dimensaoNumero: dimensaoSelecionada,
                padraoRespostaId: padraorespostaselecionado,
                basica,
                tipo_questao: tipoQuestao,
                categorias: Object.keys(categorias).filter(key => categorias[key]),

                modalidades: modalidadeSelecionada,
                questoesAdicionais: formattedQuestoesAdicionais,
            };

            if (props.questao) {
                await handleUpdateQuestao(props.questao.id, questaoData);
            } else {
                await cadastrarQuestoes(questaoData);
            }
            setSuccess('Questão salva com sucesso!');
            props.onHide();
        } catch (error) {
            setSuccess('');
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Falha ao salvar a questão');
            }
        }
    };

    const handleUpdateQuestao = async (id, questaoData) => {
        try {
            const data = await updateQuestao(id, questaoData);
            setSuccess(data.message);
        } catch (error) {
            console.error('Erro ao atualizar a questão:', error);
        }
    };

    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.questao ? 'Editar Questão' : 'Nova Questão'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <div className="question-container">
                    <textarea
                        className="input-question"
                        placeholder="Digite uma nova questão"
                        value={questao}
                        onChange={handleQuestaoChange}
                    />
                    <div className="input-question2">
                        <div className="input-question3">
                            <h6>Tipo de questão</h6>
                            <select className="form-control" value={tipoQuestao} onChange={handleTipoQuestaoChange}>
                                <option value="" disabled hidden>Selecione o tipo de questão</option>
                                {tiposQuestoes.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>{tipo.descricao}</option>
                                ))}
                            </select>
                            <h6>Eixo</h6>
                            <select className="form-control" value={eixoSelecionado} onChange={handleEixoSelect}>
                                <option value="" disabled hidden>Selecione um eixo</option>
                                {dataeixo.map(eixo => (
                                    <option key={eixo.id} value={eixo.numero}>{eixo.nome}</option>
                                ))}
                            </select>
                            <Form.Group controlId="modalidades">
                                <h6>Modalidades:</h6>
                                <AnimatedMultiSelect
                                    options={modalidades}
                                    onChange={handleModalidadesChange}
                                    placeholder="Selecione as modalidades"
                                />
                            </Form.Group>
                            <p> </p>
                            <h6>Básico</h6>
                            <ToggleSlider onToggle={handleBasica} checked={basica} />
                        </div>
                        <div className="input-question3">
                            {tipoQuestao === '2' && (
                                <div>
                                    <h6>Questões Adicionais:</h6>
                                    {questoesAdicionais.map((qAd, index) => (
                                        <div key={index} className="questao-adicional">
                                            <textarea
                                                className="form-control mb-2"
                                                value={qAd}
                                                onChange={(event) => handleQuestaoAdicionalChange(index, event)}
                                                placeholder={`Questão adicional ${index + 1}`}
                                            />
                                            <Button variant="danger" size="sm" onClick={() => handleRemoverQuestaoAdicional(index)}>
                                                Remover
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="secondary" size="sm" onClick={handleAdicionarQuestaoAdicional}>
                                        Adicionar Questão
                                    </Button>
                                </div>
                            )}
                            <h6>Padrão de resposta</h6>
                            <select className="form-control" value={padraorespostaselecionado} onChange={handlePadraoRespostaSelect}>
                                <option value="" disabled hidden>Selecione um padrão de resposta</option>
                                {datapadraoresposta.map(padrao => (
                                    <option key={padrao.id} value={padrao.id}>{padrao.sigla}</option>
                                ))}
                            </select>
                            <h6>Dimensão</h6>
                            <select className="form-control" value={dimensaoSelecionada} onChange={(e) => setDimensaoSelecionada(e.target.value)}>
                                <option value="" disabled hidden>Selecione uma dimensão</option>
                                {datadimensao.map(dimensao => (
                                    <option key={dimensao.numero} value={dimensao.numero}>{dimensao.nome}</option>
                                ))}
                            </select>
                            <h6>Categoria</h6>
                            <CategoryCheckboxes categorias={categorias} onChange={handleCategoriaChange} />
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar onClick={props.onHide}>Cancelar</ButtonCancelar>
                <ButtonCadastrar onClick={handleCadastrarQuestao}>Cadastrar</ButtonCadastrar>

            </Modal.Footer>
        </Modal>
    );
}

export default Modal_Questoes;
