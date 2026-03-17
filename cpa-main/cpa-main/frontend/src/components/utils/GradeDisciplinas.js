// GradeDisciplinas.js
import React, { useState, useEffect } from "react";

const GradeDisciplinas = ({ onChange }) => {
    const [disciplinas, setDisciplinas] = useState([]);
    const [respostas, setRespostas] = useState({});

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

    useEffect(() => {
        async function fetchDisciplinas() {
            try {
                const response = await fetch(
                    "https://api.uea.edu.br/lyceum/cadu/aluno/historico/matriculapessoal/ano/2024/semestre/2"
                );
                const data = await response.json();
                // Assume que o array de disciplinas está na propriedade "message"
                setDisciplinas(data.message || []);
            } catch (error) {
                console.error("Erro ao buscar disciplinas:", error);
            }
        }
        fetchDisciplinas();
    }, []);

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

    return (
        <div className="grade-disciplinas">
            <h2>Avaliação das Disciplinas</h2>
            {disciplinas.length === 0 ? (
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
