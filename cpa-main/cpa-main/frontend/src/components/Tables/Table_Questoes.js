// src/components/Tables/Table_Questoes.js
import React, { useEffect, useRef, useState } from 'react';
import './Table.css';
import { Modal, Button, Spinner, Table } from 'react-bootstrap';
import { getQuestoes, deleteQuestoes, getQuestaoById } from "../../services/questoesService";
import ModalQuestoes from "../Modals/Modal_Questoes";
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { Toast } from 'primereact/toast';

// ── Modal de confirmação de exclusão ─────────────
function ConfirmDeleteModal({ show, onConfirm, onCancel, questao, loading }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar exclusão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Tem certeza que deseja excluir a questão:</p>
                <blockquote className="blockquote">
                    <p className="mb-0" style={{ fontSize: '0.95rem' }}>
                        {questao?.descricao}
                    </p>
                </blockquote>
                <p className="text-muted small mt-2">Esta ação não pode ser desfeita.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    disabled={loading}
                    style={{ minWidth: 100 }}
                >
                    {loading
                        ? <><Spinner size="sm" animation="border" className="me-2" />Excluindo...</>
                        : 'Excluir'
                    }
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

// ── Tabela principal ──────────────────────────────
const Table_Questoes = ({ searchQuery = '', updateTable, onSuccess }) => {
    const [dataQuestoes, setDataQuestoes] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    // modal de EDIÇÃO (só edição, nunca criação)
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    // modal de confirmação de exclusão
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingQuestao, setDeletingQuestao] = useState(null);
    const [deletingLoading, setDeletingLoading] = useState(false);

    const toast = useRef(null);

    const showToast = (severity, detail) => {
        toast.current?.show({
            severity,
            summary: severity === 'error' ? 'Erro' : 'Sucesso',
            detail,
            life: 3000,
        });
    };

    // ── busca na API ───────────────────────────────
    const fetchQuestoes = async () => {
        setLoadingTable(true);
        try {
            const data = await getQuestoes();
            setDataQuestoes(data || []);
        } catch (error) {
            showToast('error', 'Erro ao carregar questões.');
        } finally {
            setLoadingTable(false);
        }
    };

    // Re-busca quando updateTable muda (criou ou editou no pai)
    useEffect(() => {
        fetchQuestoes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTable]);

    // ── filtro ─────────────────────────────────────
    const filtered = dataQuestoes.filter(q => {
        const term = searchQuery.toLowerCase();
        return (
            (q.descricao || '').toLowerCase().includes(term) ||
            (q.dimensao?.nome || '').toLowerCase().includes(term) ||
            (q.dimensao?.eixo?.nome || '').toLowerCase().includes(term)
        );
    });

    // ── edição ─────────────────────────────────────
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
        fetchQuestoes(); // refetch local após editar
        showToast('success', message || 'Questão atualizada com sucesso!');
        if (onSuccess) onSuccess(message || 'Questão atualizada com sucesso!');
    };

    // ── exclusão ───────────────────────────────────
    const handleDeleteRequest = (questao) => {
        setDeletingQuestao(questao);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingQuestao) return;
        setDeletingLoading(true);
        try {
            await deleteQuestoes(deletingQuestao.id);
            // Remove localmente — sem reload
            setDataQuestoes(prev => prev.filter(q => q.id !== deletingQuestao.id));
            showToast('success', 'Questão excluída com sucesso!');
        } catch (error) {
            showToast('error', 'Erro ao excluir questão. Tente novamente.');
        } finally {
            setDeletingLoading(false);
            setShowDeleteModal(false);
            setDeletingQuestao(null);
        }
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
                questao={deletingQuestao}
                loading={deletingLoading}
            />
        </div>
    );
};

export default Table_Questoes;