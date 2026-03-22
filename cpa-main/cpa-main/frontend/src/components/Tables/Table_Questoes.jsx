// src/components/Tables/Table_Questoes.js
import React, { useEffect, useState } from 'react';
import './Table.css';
import { useGetQuestoesQuery } from "../../hooks/queries/useQuestaoQueries";
import { useDeleteQuestaoMutation } from "../../hooks/mutations/useQuestaoMutations";
import { getQuestaoById } from "../../api/questoes";
import { useNotification } from "../../context/NotificationContext";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ModalQuestoes from '../Modals/Modal_Questoes';
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';

const SkeletonRow = () => (
    <tr>
        {[180, 100, 100, 100, 80].map((w, i) => (
            <td key={i} style={{ padding: '14px 16px' }}>
                <div style={{
                    height: 13, width: w === '100%' ? '70%' : w, borderRadius: 6,
                    background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
                    backgroundSize: '400% 100%',
                    animation: 'skeletonPulse 1.4s ease infinite',
                }} />
            </td>
        ))}
    </tr>
);

const thStyle = {
    padding: '11px 16px', fontSize: 11, fontWeight: 600,
    color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px',
    textAlign: 'left', whiteSpace: 'nowrap',
    background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
};
const tdStyle = { padding: '14px 16px', color: '#1a202c', verticalAlign: 'middle', fontSize: 13 };

const ActionBtn = ({ onClick, color, hoverBg, title, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '5px 8px',
            fontSize: 11, fontWeight: 600,
            background: 'transparent', color,
            border: `1.5px solid ${color}33`,
            borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 150ms', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
        {children}
    </button>
);

const Table_Questoes = ({ searchQuery = '', onSuccess }) => {
    const { data: dataQuestoes = [], isLoading: loadingTable, isError } = useGetQuestoesQuery();
    const deleteMutation = useDeleteQuestaoMutation();
    const showNotification = useNotification();

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingQuestao, setDeletingQuestao] = useState(null);

    useEffect(() => { if (isError) showNotification('Erro ao carregar questões.', 'error'); }, [isError, showNotification]);

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
            showNotification('Erro ao carregar detalhes da questão.', 'error');
        }
    };

    const handleEditSaved = (message) => {
        setShowEditModal(false);
        setSelectedQuestion(null);
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
                if (onSuccess) onSuccess('Questão excluída com sucesso!');
                setShowDeleteModal(false);
                setDeletingQuestao(null);
            },
            onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao excluir questão. Tente novamente.', 'error')
        });
    };

    return (
        <div>
            <style>{`.q-row:hover td { background:#f8fafc !important; }`}</style>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Questão</th>
                        <th style={thStyle}>Eixo</th>
                        <th style={thStyle}>Dimensão</th>
                        <th style={thStyle}>Categorias</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {loadingTable ? (
                        [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                    ) : filtered.length > 0 ? (
                        filtered.map((questao) => (
                            <tr key={questao.id} className="q-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 150ms' }}>
                                <td style={{ ...tdStyle, maxWidth: 400 }}>
                                    <div style={{ fontWeight: 500, lineHeight: '1.4' }}>{questao.descricao}</div>
                                    {questao.questoesAdicionais?.length > 0 && (
                                        <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: '2px solid #e2e8f0' }}>
                                            {questao.questoesAdicionais.map(qa => (
                                                <div key={qa.id} style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>• {qa.descricao}</div>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td style={{ ...tdStyle, color: '#4a5568' }}>
                                    <span style={{ padding: '2px 8px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11 }}>
                                        {questao.dimensao?.eixo?.nome || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, color: '#64748b', fontSize: 12 }}>{questao.dimensao?.nome || 'N/A'}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {questao.categorias?.length > 0
                                            ? questao.categorias.map(c => (
                                                <span key={c.id} style={{ padding: '1px 6px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{c.nome}</span>
                                            ))
                                            : <span style={{ color: '#cbd5e1' }}>Sem categorias</span>}
                                    </div>
                                </td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                        <ActionBtn
                                            onClick={() => handleEditQuestion(questao)}
                                            color="#1D5E24"
                                            hoverBg="#e8f5e9"
                                            title="Editar"
                                        >
                                            <FaRegEdit size={12} /> Editar
                                        </ActionBtn>
                                        <ActionBtn
                                            onClick={() => handleDeleteRequest(questao)}
                                            color="#ef4444"
                                            hoverBg="#fee2e2"
                                            title="Excluir"
                                        >
                                            <IoTrashOutline size={12} /> Excluir
                                        </ActionBtn>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '56px 24px', color: '#718096', fontSize: 14 }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>❓</div>
                                {searchQuery
                                    ? `Nenhuma questão encontrada para "${searchQuery}".`
                                    : 'Nenhuma questão cadastrada.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

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