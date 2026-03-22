import React, { useEffect, useState } from 'react';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';
import { Form, Button } from 'react-bootstrap';
import Modal from "react-bootstrap/Modal";
import "./Modal_Questoes.css";
import { ToggleSlider } from 'react-toggle-slider';
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import { CategoryCheckboxes } from '../utils/Check_boxes';
import { useGetEixosQuery } from '../../hooks/queries/useEixoQueries';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useGetPadraoRespostaQuery } from '../../hooks/queries/usePadraoRespostaQueries';
import { useGetDimensoesByEixoQuery } from '../../hooks/queries/useDimensaoQueries';
import { useGetTiposQuestoesQuery } from '../../hooks/queries/useTipoQuestaoQueries';
import { useAdicionarQuestaoMutation, useEditQuestaoMutation } from '../../hooks/mutations/useQuestaoMutations';

function Modal_Questoes(props) {
    const { data: eixos = [] } = useGetEixosQuery();
    const { data: padraoResposta = [] } = useGetPadraoRespostaQuery();
    const { data: tiposQuestoes = [] } = useGetTiposQuestoesQuery();
    const { data: modalidadesRaw = [] } = useGetModalidadesQuery();

    const [eixoSelecionado, setEixoSelecionado] = useState('');
    const { data: dimensoes = [] } = useGetDimensoesByEixoQuery(eixoSelecionado);

    const adicionarMutation = useAdicionarQuestaoMutation();
    const editarMutation = useEditQuestaoMutation();

    const [dimensaoSelecionada, setDimensaoSelecionada] = useState('');
    const [error, setError] = useState('');
    const [categorias, setCategorias] = useState({});
    const [modalidadeSelecionada, setModalidadeSelecionada] = useState([]);
    const [basica, setBasica] = useState(false);
    const [questao, setQuestao] = useState('');
    const [padraorespostaselecionado, setPadraoRespostaselecionado] = useState('');
    const [tipoQuestao, setTipoQuestao] = useState('');
    const [questoesAdicionais, setQuestoesAdicionais] = useState([]);

    const modalidadesOptions = React.useMemo(() =>
        modalidadesRaw.map(m => ({ value: m.id, label: m.mod_ensino })),
        [modalidadesRaw]);

    useEffect(() => {
        if (props.questao && props.show) {
            setQuestao(props.questao.descricao || '');
            setEixoSelecionado(props.questao.dimensao?.eixo?.numero || '');
            setDimensaoSelecionada(props.questao.dimensao?.numero || '');
            setBasica(props.questao.basica || false);
            setPadraoRespostaselecionado(props.questao.padraoRespostaId || '');
            setTipoQuestao(props.questao.tipo_questao_id || '');
            setQuestoesAdicionais(props.questao.questoesAdicionais?.map(qa => qa.descricao) || []);

            const cats = {};
            props.questao.categorias?.forEach(c => cats[c.id] = true);
            setCategorias(cats);

            setModalidadeSelecionada(props.questao.modalidades?.map(m => m.id) || []);
        } else if (!props.show) {
            resetFormState();
        }
    }, [props.questao, props.show]);

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
        setQuestoesAdicionais([]);
    };

    const handleQuestaoChange = (event) => setQuestao(event.target.value);

    const handleEixoSelect = (event) => {
        setEixoSelecionado(event.target.value);
        setDimensaoSelecionada('');
    };

    const handleModalidadesChange = (selectedOptions) => {
        const selectedIds = selectedOptions.map(option => option.value);
        setModalidadeSelecionada(selectedIds);
    };

    const handleCategoriaChange = (event) => {
        const { id } = event.target;
        setCategorias(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleBasica = (event) => setBasica(event);

    const handlePadraoRespostaSelect = (event) => setPadraoRespostaselecionado(event.target.value);

    const handleTipoQuestaoChange = (event) => setTipoQuestao(event.target.value);

    const handleAdicionarQuestaoAdicional = () => setQuestoesAdicionais([...questoesAdicionais, '']);

    const handleQuestaoAdicionalChange = (index, event) => {
        const newArray = [...questoesAdicionais];
        newArray[index] = event.target.value;
        setQuestoesAdicionais(newArray);
    };

    const handleRemoverQuestaoAdicional = (index) => {
        setQuestoesAdicionais(questoesAdicionais.filter((_, i) => i !== index));
    };

    const handleCadastrarQuestao = () => {
        if (!questao.trim()) {
            setError('A questão não pode estar vazia.');
            return;
        }

        const questaoData = {
            questao,
            dimensaoNumero: dimensaoSelecionada,
            padraoRespostaId: padraorespostaselecionado,
            basica,
            tipo_questao: tipoQuestao,
            categorias: Object.keys(categorias).filter(key => categorias[key]),
            modalidades: modalidadeSelecionada,
            questoesAdicionais: questoesAdicionais.filter(q => q.trim()).map(item => ({ descricao: item })),
        };

        const mutation = props.questao ? editarMutation : adicionarMutation;
        const payload = props.questao ? { id: props.questao.id, questao: questaoData } : questaoData;

        mutation.mutate(payload, {
            onSuccess: () => {
                resetFormState();
                props.onHide();
                if (props.onSuccess) props.onSuccess('Questão salva com sucesso!');
            },
            onError: (err) => {
                setError(err.response?.data?.error || 'Falha ao salvar a questão');
            }
        });
    };

    const isLoading = adicionarMutation.isPending || editarMutation.isPending;

    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.questao ? 'Editar Questão' : 'Nova Questão'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}
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
                                {eixos.map(eixo => (
                                    <option key={eixo.id} value={eixo.numero}>{eixo.nome}</option>
                                ))}
                            </select>
                            <Form.Group controlId="modalidades">
                                <h6>Modalidades:</h6>
                                <AnimatedMultiSelect
                                    options={modalidadesOptions}
                                    onChange={handleModalidadesChange}
                                    placeholder="Selecione as modalidades"
                                    value={modalidadesOptions.filter(o => modalidadeSelecionada.includes(o.value))}
                                />
                            </Form.Group>
                            <p> </p>
                            <h6>Básico</h6>
                            <ToggleSlider onToggle={handleBasica} checked={basica} />
                        </div>
                        <div className="input-question3">
                            {tipoQuestao?.toString() === '2' && (
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
                                {padraoResposta.map(padrao => (
                                    <option key={padrao.id} value={padrao.id}>{padrao.sigla}</option>
                                ))}
                            </select>
                            <h6>Dimensão</h6>
                            <select className="form-control" value={dimensaoSelecionada} onChange={(e) => setDimensaoSelecionada(e.target.value)}>
                                <option value="" disabled hidden>Selecione uma dimensão</option>
                                {dimensoes.map(dimensao => (
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
                <ButtonCancelar onClick={props.onHide} disabled={isLoading}>Cancelar</ButtonCancelar>
                <ButtonCadastrar onClick={handleCadastrarQuestao} disabled={isLoading}>
                    {isLoading ? (props.questao ? 'Salvando...' : 'Cadastrando...') : (props.questao ? 'Salvar' : 'Cadastrar')}
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default Modal_Questoes;
