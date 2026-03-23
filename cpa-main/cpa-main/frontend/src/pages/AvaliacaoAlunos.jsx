import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import logo from '../assets/imgs/cpa_logo.svg';
import simIcon from '../assets/imgs/yes_emoji.svg';
import naoIcon from '../assets/imgs/no_emoji.svg';
import naoSeiIcon from '../assets/imgs/idono_emoji.svg';
import './AvaliacaoAlunos.css';
import {
    useGetAvaliacaoByIdQuery,
    useGetVerificarRespostaQuery
} from '../hooks/queries/useAvaliacaoQueries';
import { useAdicionarRespostaMutation } from '../hooks/mutations/useRespostaMutations';

const AvaliacaoAlunos = () => {
    const { id: avaliacaoId } = useParams();
    const navigate = useNavigate();
    const [idUnidadeMedia, setIdUnidadeMedia] = useState(null);
    const token = getToken();
    const toast = useRef(null);

    const {
        data: avaliacao,
        isLoading: isLoadingAvaliacao,
        isError: isErrorAvaliacao
    } = useGetAvaliacaoByIdQuery(id);

    const {
        data: jaRespondeu,
        isLoading: isLoadingVerificacao
    } = useGetVerificarRespostaQuery(id);

    const adicionarRespostaMutation = useAdicionarRespostaMutation();

    const [respostas, setRespostas] = useState({});
    const [expandedEixo, setExpandedEixo] = useState(null);
    const [progresso, setProgresso] = useState(0);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (jaRespondeu) {
            showToast('Você já respondeu esta avaliação', 'warn');
            setTimeout(() => navigate('/alunos'), 3000);
        }

        if (isErrorAvaliacao) {
            showToast('Erro ao carregar avaliação', 'error');
            navigate('/alunos');
        }
    }, [id, token, navigate, jaRespondeu, isErrorAvaliacao]);

    useEffect(() => {
        const total = avaliacao?.avaliacao_questoes?.reduce((acc, curr) =>
            acc + (curr.questoes.questoesAdicionais?.length || 1), 0) || 0;
        const respondidas = Object.keys(respostas).length;
        setProgresso(Math.round((respondidas / total) * 100));
    }, [respostas, avaliacao]);

    const groupByEixoDimensao = () => {
        return avaliacao?.avaliacao_questoes?.reduce((acc, { questoes }) => {
            const eixoKey = `${questoes.dimensoes.eixos.numero} - ${questoes.dimensoes.eixos.nome}`;
            const dimensaoKey = `${questoes.dimensoes.numero} - ${questoes.dimensoes.nome}`;

            if (!acc[eixoKey]) {
                acc[eixoKey] = {
                    nome: questoes.dimensoes.eixos.nome,
                    dimensoes: {}
                };
            }

            if (!acc[eixoKey].dimensoes[dimensaoKey]) {
                acc[eixoKey].dimensoes[dimensaoKey] = [];
            }

            acc[eixoKey].dimensoes[dimensaoKey].push(questoes);
            return acc;
        }, {}) || {};
    };

    const handleResposta = (questaoId, alternativaId, adicionalId = null) => {
        const key = adicionalId ? `${questaoId}-${adicionalId}` : questaoId;
        setRespostas(prev => ({ ...prev, [key]: alternativaId }));
    };

    const renderAlternativas = (questao, subquestaoId = null) => {
        return questao.padrao_resposta.alternativas.map((alt) => {
            const inputName = subquestaoId
                ? `questao-${questao.id}-${subquestaoId}`
                : `questao-${questao.id}`;

            const inputKey = subquestaoId
                ? `${questao.id}-${subquestaoId}`
                : questao.id;

            return (
                <label key={alt.id} className="alternativa">
                    <div className="emoji-container">
                        {alt.descricao === 'Sim' && <img src={simIcon} alt="Sim" />}
                        {alt.descricao === 'Não' && <img src={naoIcon} alt="Não" />}
                        {alt.descricao === 'Não sei responder' && <img src={naoSeiIcon} alt="Não sei" />}
                    </div>
                    <input
                        type="radio"
                        name={inputName}
                        value={alt.id}
                        checked={respostas[inputKey] === alt.id}
                        onChange={() => handleResposta(questao.id, alt.id, subquestaoId)}
                    />
                    <span>{alt.descricao}</span>
                </label>
            );
        });
    };

    const renderQuestoes = (questao) => {
        const subquestoes = questao.questoesAdicionais || questao.questoes_adicionais || [];

        if (subquestoes.length > 0) {
            return (
                <div className="grade-question">
                    <p className="enunciado-principal">{questao.descricao}</p>
                    {subquestoes.map((sub) => (
                        <div key={sub.id} className="subquestao">
                            <p className="sub-enunciado">{sub.descricao}</p>
                            <div className="alternativas-grid">
                                {renderAlternativas(questao, sub.id)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="questao-simples">
                <p className="enunciado-principal">{questao.descricao}</p>
                <div className="alternativas-grid">
                    {renderAlternativas(questao)}
                </div>
            </div>
        );
    };

    const handleSubmit = async () => {
        // Construir o payload seguindo a estrutura correta
        const respostasFormatadas = avaliacao.avaliacao_questoes.flatMap((avaliacaoQuestao) => {
            const questao = avaliacaoQuestao.questoes;
            const subquestoes = questao.questoesAdicionais || questao.questoes_adicionais || [];

            // Questões com subquestões
            if (subquestoes.length > 0) {
                return subquestoes.map((sub) => {
                    const key = `${questao.id}-${sub.id}`;
                    return {
                        id_avaliacao_questoes: avaliacaoQuestao.id,
                        adicionalId: sub.id, // Apenas para subquestões
                        id_alternativa: parseInt(respostas[key], 10)
                    };
                });
            }

            // Questões sem subquestões
            return [{
                id_avaliacao_questoes: avaliacaoQuestao.id,
                id_alternativa: parseInt(respostas[questao.id], 10)
            }];
        });

        // Verificar respostas incompletas
        if (respostasFormatadas.some(resp => !resp.id_alternativa)) {
            showToast('Responda todas as questões antes de enviar!', 'warn');
            return;
        }

        const payload = {
            idAvaliacao: parseInt(id),
            respostas: respostasFormatadas
        };

        adicionarRespostaMutation.mutate(payload, {
            onSuccess: () => {
                showToast('Avaliação enviada com sucesso!', 'success');
                setTimeout(() => navigate('/alunos'), 2000);
            },
            onError: (error) => {
                showToast(error.message || 'Erro ao enviar avaliação', 'error');
            }
        });
    };

    const showToast = (message, severity) => {
        toast.current.show({
            severity,
            summary: severity === 'error' ? 'Erro' : 'Sucesso',
            detail: message,
            life: 3000
        });
    };

    if (isLoadingAvaliacao || isLoadingVerificacao) return <div className="loading">Carregando...</div>;

    return (
        <div className="avaliacao-container">
            <header className="avaliacao-header">
                <img src={logo} alt="CPA Logo" className="logo" />
                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${progresso}%` }}></div>
                    </div>
                    <span>{progresso}% concluído</span>
                </div>
            </header>

            <main className="avaliacao-main">
                <div className="avaliacao-info">
                    <h1>{avaliacao.titulo}</h1>
                    <p className="periodo">{avaliacao.periodo_letivo}</p>
                </div>

                <div className="secoes">
                    {Object.entries(groupByEixoDimensao()).map(([eixoKey, eixoData]) => (
                        <div key={eixoKey} className="eixo-card">
                            <div
                                className="eixo-header"
                                onClick={() => setExpandedEixo(prev =>
                                    prev === eixoKey ? null : eixoKey)}
                            >
                                <div className="eixo-title">
                                    <h2>{eixoData.nome}</h2>
                                    <span className="status">{Object.keys(eixoData.dimensoes).length} Dimensões</span>
                                </div>
                                {expandedEixo === eixoKey ? <FaChevronUp /> : <FaChevronDown />}
                            </div>

                            {expandedEixo === eixoKey && (
                                <div className="dimensoes-container">
                                    {Object.entries(eixoData.dimensoes).map(([dimensaoKey, questoes]) => (
                                        <div key={dimensaoKey} className="dimensao-card">
                                            <div className="dimensao-header">
                                                <h3>{dimensaoKey.split(' - ')[1]}</h3>
                                                <span>{questoes.length} Questões</span>
                                            </div>

                                            <div className="questoes-list">
                                                {questoes.map((questao) => (
                                                    <div key={questao.id} className="questao-item">
                                                        {renderQuestoes(questao)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={adicionarRespostaMutation.isPending}
                >
                    {adicionarRespostaMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
            </main>
        </div>
    );
};

export default AvaliacaoAlunos;