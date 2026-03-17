import React, { useEffect, useState } from 'react';
import './Table.css';
import { Table } from 'react-bootstrap';
import { getQuestoes, deleteQuestoes, getQuestaoById } from "../../services/questoesService";
import Modal_Questoes from "../Modals/Modal_Questoes";
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";

const Table_Questoes = () => {
    const [modalShow, setModalShow] = useState(false);
    const [dataQuestoes, setDataQuestoes] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    // Função para buscar todas as questões do serviço
    const fetchQuestoes = async () => {
        try {
            const data = await getQuestoes();
            setDataQuestoes(data);
        } catch (error) {
            console.error("Erro ao buscar questões", error);
        }
    };

    // Carrega as questões ao montar o componente
    useEffect(() => {
        fetchQuestoes();
    }, []);

    // Função para editar uma questão
    const handleEditQuestion = async (questao) => {
        try {
            const questaoDetails = await getQuestaoById(questao.id); // Busca todos os detalhes da questão
            setSelectedQuestion(questaoDetails); // Define a questão selecionada
            setModalShow(true); // Abre o modal
        } catch (error) {
            console.error("Erro ao buscar detalhes da questão", error);
        }
    };

    // Função para deletar uma questão
    const handleDeleteQuestion = async (item) => {
        try {
            await deleteQuestoes(item.id);
            fetchQuestoes(); // Atualiza a lista após deletar uma questão
        } catch (error) {
            console.error("Erro ao deletar questão", error);
        }
    };

    return (
        <div>
            <Table striped>
                <thead>
                    <tr className="tr">
                        <th>Questão</th>
                        <th>Eixo</th>
                        <th>Dimensão</th>
                        <th>Categorias</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(dataQuestoes) && dataQuestoes.length > 0 ? (
                        dataQuestoes.map((questao) => (
                            <tr key={questao.id}>
                                {/* Coluna com a questão principal e, se existirem, as questões adicionais */}
                                <td>
                                    <div>
                                        {questao.descricao}
                                    </div>
                                    {questao.questoesAdicionais && questao.questoesAdicionais.length > 0 && (
                                        <div style={{ marginTop: '5px' }}>
                                            
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                {questao.questoesAdicionais.map((qa) => (
                                                    <li key={qa.id}>{qa.descricao}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </td>

                                {/* Coluna do eixo */}
                                <td>
                                    {questao.dimensao && questao.dimensao.eixo
                                        ? questao.dimensao.eixo.nome
                                        : 'N/A'}
                                </td>

                                {/* Coluna da dimensão */}
                                <td>
                                    {questao.dimensao
                                        ? questao.dimensao.nome
                                        : 'N/A'}
                                </td>

                                {/* Coluna de categorias */}
                                <td>
                                    {questao.categorias && questao.categorias.length > 0 ? (
                                        questao.categorias.map((categoria) => (
                                            <span key={categoria.id}>
                                                {categoria.nome}
                                                <br />
                                            </span>
                                        ))
                                    ) : (
                                        'Sem categorias'
                                    )}
                                </td>

                                {/* Coluna de ações */}
                                <td>
                                    <div className="action-row">
                                        <FaRegEdit
                                            size={24}
                                            cursor="pointer"
                                            onClick={() => handleEditQuestion(questao)}
                                        />
                                        <IoTrashOutline
                                            size={24}
                                            cursor="pointer"
                                            onClick={() => handleDeleteQuestion(questao)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">Nenhuma questão cadastrada</td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <Modal_Questoes
                show={modalShow}
                onHide={() => setModalShow(false)}
                questao={selectedQuestion}
                onUpdateQuestion={fetchQuestoes} // Atualiza a tabela após eventuais alterações
            />
        </div>
    );
};

export default Table_Questoes;
