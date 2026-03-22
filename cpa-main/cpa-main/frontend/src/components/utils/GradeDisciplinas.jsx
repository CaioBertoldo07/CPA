// GradeDisciplinas.js
import React, { useState } from "react";
import { useGetHistoricoMatriculaQuery } from "../../hooks/queries/useEstudanteQueries";

const GradeDisciplinas = ({ onChange }) => {
    const [respostas, setRespostas] = useState({});
    const { data: historicoData, isLoading: loading } = useGetHistoricoMatriculaQuery(2024, 2);
    const disciplinas = historicoData?.message || [];

    // Ao alterar uma resposta, atualizamos o estado local e repassamos para o componente pai
    const handleChange = (disciplinaId, questaoIndex, value) => {
        setRespostas((prev) => {
            const newRespostas = {
                ...prev,
                [disciplinaId]: {
                    ...prev[disciplinaId],
                    [questaoIndex]: value,
                },
            };
            // Notifica o componente pai com as respostas atuais da grade
            onChange(newRespostas);
            return newRespostas;
        });
    };

    // As 10 perguntas fixas para cada disciplina
    const questoes = [
        "Apresentou o plano de ensino?",
        "Incentiva à participação em eventos científicos ou pesquisas?",
        "Desenvolveu programa ou projeto de pesquisa ou extensão?",
        "Os meios de avaliações corresponderam aos conteúdos propostos no plano de ensino?",
        "Apresentou pontualidade nas aulas?",
        "Disponibilizou horário para atendimento individualizado aos discentes?",
        "Apresentou seu(s) texto(s) e trabalho(s) autoral(is)?",
        "Disponibilizou texto(s) e trabalho(s) internacional(is)?",
        "Realizou atividade prática?",
        "Utilizou os laboratórios em suas aulas?"
    ];

    return (
        <div className="grade-disciplinas">
            <h2>Avaliação das Disciplinas</h2>
            {loading ? (
                <p>Carregando disciplinas...</p>
            ) : (
                disciplinas.map((disciplina) => (
                    <div
                        key={disciplina.DISC_DISCIPLINA}
                        className="disciplina-block"
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        <h3>{disciplina.DISC_NOME}</h3>
                        <p>Avalie os itens abaixo no semestre letivo:</p>
                        <ol>
                            {questoes.map((questao, index) => (
                                <li key={index} style={{ marginBottom: "8px" }}>
                                    <span>{questao}</span>
                                    <select
                                        onChange={(e) =>
                                            handleChange(disciplina.DISC_DISCIPLINA, index, e.target.value)
                                        }
                                        defaultValue=""
                                        style={{ marginLeft: "10px" }}
                                    >
                                        <option value="" disabled>
                                            Selecione
                                        </option>
                                        <option value="sim">Sim</option>
                                        <option value="nao">Não</option>
                                        <option value="parcialmente">Parcialmente</option>
                                    </select>
                                </li>
                            ))}
                        </ol>
                    </div>
                ))
            )}
        </div>
    );
};

export default GradeDisciplinas;
