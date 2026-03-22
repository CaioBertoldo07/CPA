// src/components/Tables/Table_Questoes.js
import React, { useEffect, useRef, useState } from 'react';
import './Table.css';
import { Modal, Button, Spinner, Table } from 'react-bootstrap';
import { useGetQuestoesQuery, useGetQuestaoByIdQuery } from "../../hooks/queries/useQuestaoQueries";
import { useDeleteQuestaoMutation } from "../../hooks/mutations/useQuestaoMutations";
import { getQuestaoById } from "../../api/questoes";
import { Toast } from 'primereact/toast';
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ModalQuestoes from '../Modals/Modal_Questoes';
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';

const Table_Questoes = ({ searchQuery = '', onSuccess }) => {
    const { data: dataQuestoes = [], isLoading: loadingTable, isError } = useGetQuestoesQuery();
    const deleteMutation = useDeleteQuestaoMutation();

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingQuestao, setDeletingQuestao] = useState(null);

    const toast = useRef(null);

    useEffect(() => { if (isError) showToast('error', 'Erro ao carregar questões.'); }, [isError]);

    const showToast = (severity, detail) => {
        toast.current?.show({ severity, summary: severity === 'error' ? 'Erro' : 'Sucesso', detail, life: 3000 });
    };

    const filtered = dataQuestoes.filter(q => {
        const term = searchQuery.toLowerCase();
        return (
            (q.descricao || '').toLowerCase().includes(term) ||
            (q.dimensao?.nome || '').toLowerCase().includes(term) ||
            (q.dimensao?.eixo?.nome || '').toLowerCase().includes(term)
        );
    });

    const handleEditQuestion = async (questao) => {
        try {
            const details = await getQuestaoById(questao.id);
            setSelectedQuestion(details);
            setShowEditModal(true);
        } catch (error) {
            showToast('error', 'Erro ao carregar detalhes da questão.');
        }
    };

    const handleEditSaved = (message) => {
        setShowEditModal(false);
        setSelectedQuestion(null);
        showToast('success', message || 'Questão atualizada com sucesso!');
        if (onSuccess) onSuccess(message || 'Questão atualizada com sucesso!');
    };

    const handleDeleteRequest = (questao) => {
        setDeletingQuestao(questao);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (!deletingQuestao) return;
        deleteMutation.mutate(deletingQuestao.id, {
            onSuccess: () => {
                showToast('success', 'Questão excluída com sucesso!');
                setShowDeleteModal(false);
                setDeletingQuestao(null);
            },
            onError: () => showToast('error', 'Erro ao excluir questão. Tente novamente.')
        });
    };

    // ── render ─────────────────────────────────────
    return (
        <div>
            <Toast ref={toast} />

            {loadingTable ? (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-2 text-muted">Carregando questões...</p>
                </div>
            ) : (
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
                        {filtered.length > 0 ? (
                            filtered.map((questao) => (
                                <tr key={questao.id}>
                                    <td>
                                        <div>{questao.descricao}</div>
                                        {questao.questoesAdicionais?.length > 0 && (
                                            <ul style={{ margin: 0, paddingLeft: '20px', marginTop: 5 }}>
                                                {questao.questoesAdicionais.map(qa => (
                                                    <li key={qa.id}>{qa.descricao}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </td>
                                    <td>{questao.dimensao?.eixo?.nome || 'N/A'}</td>
                                    <td>{questao.dimensao?.nome || 'N/A'}</td>
                                    <td>
                                        {questao.categorias?.length > 0
                                            ? questao.categorias.map(c => (
                                                <span key={c.id}>{c.nome}<br /></span>
                                            ))
                                            : 'Sem categorias'}
                                    </td>
                                    <td>
                                        <div className="action-row">
                                            <FaRegEdit
                                                size={24}
                                                cursor="pointer"
                                                title="Editar questão"
                                                onClick={() => handleEditQuestion(questao)}
                                            />
                                            <IoTrashOutline
                                                size={24}
                                                cursor="pointer"
                                                title="Excluir questão"
                                                onClick={() => handleDeleteRequest(questao)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted py-3">
                                    {searchQuery
                                        ? `Nenhuma questão encontrada para "${searchQuery}".`
                                        : 'Nenhuma questão cadastrada.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            {/* Modal de EDIÇÃO apenas — criação fica no Questoes.js */}
            {showEditModal && selectedQuestion && (
                <ModalQuestoes
                    show={showEditModal}
                    onHide={() => { setShowEditModal(false); setSelectedQuestion(null); }}
                    questao={selectedQuestion}
                    onUpdateQuestion={handleEditSaved}
                    onSuccess={handleEditSaved}
                />
            )}

            {/* Modal de confirmação de exclusão */}
            <ConfirmDeleteModal
                show={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setShowDeleteModal(false); setDeletingQuestao(null); }}
                message={deletingQuestao ? `Tem certeza que deseja excluir a questão "${deletingQuestao.descricao}"?` : ""}
                loading={deleteMutation.isPending}
            />
        </div>
    );
};

export default Table_Questoes;