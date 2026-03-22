import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import EditModal from '../Modals/ModalUpdateModalidades';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useDeleteModalidadeMutation } from '../../hooks/mutations/useModalidadeMutations';

const SkeletonRow = () => (
    <tr>
        {[180, 80, 120, 100].map((w, i) => (
            <td key={i} style={{ padding: '14px 16px' }}>
                <div style={{
                    height: 13, width: w, borderRadius: 6,
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
            gap: 4, padding: '5px 10px',
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

const Table_Modalidades = ({ searchQuery = '', onSuccess }) => {
    const { data: modalidades = [], isLoading: loading, isError } = useGetModalidadesQuery();
    const deleteMutation = useDeleteModalidadeMutation();
    const showNotification = useNotification();

    const [editingModalidade, setEditingModalidade] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingModalidade, setDeletingModalidade] = useState(null);

    useEffect(() => { if (isError) showNotification('Erro ao carregar modalidades.', 'error'); }, [isError, showNotification]);

    const filtered = modalidades.filter(m => {
        const q = searchQuery.toLowerCase();
        return (
            (m.mod_ensino || '').toLowerCase().includes(q) ||
            (m.mod_oferta || '').toLowerCase().includes(q)
        );
    });

    const handleEdit = (modalidade) => {
        setEditingModalidade(modalidade);
        setShowEditModal(true);
    };

    const handleEditSave = (message) => {
        setShowEditModal(false);
        if (onSuccess) onSuccess(message);
    };

    const handleDeleteRequest = (modalidade) => {
        setDeletingModalidade(modalidade);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (!deletingModalidade) return;
        deleteMutation.mutate(deletingModalidade.id, {
            onSuccess: () => {
                if (onSuccess) onSuccess(`Modalidade "${deletingModalidade.mod_ensino}" excluída com sucesso!`);
                setShowDeleteModal(false);
                setDeletingModalidade(null);
            },
            onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao excluir modalidade. Tente novamente.', 'error')
        });
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeletingModalidade(null);
    };

    return (
        <div>
            <style>{`.mod-row:hover td { background:#f8fafc !important; }`}</style>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Modalidade de ensino</th>
                        <th style={thStyle}>Num. questões</th>
                        <th style={thStyle}>Data de criação</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                    ) : filtered.length > 0 ? (
                        filtered.map((modalidade, index) => (
                            <tr key={modalidade.id ?? index} className="mod-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 150ms' }}>
                                <td style={{ ...tdStyle, fontWeight: 500 }}>{modalidade.mod_ensino}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '2px 8px', background: '#f1f5f9', color: '#475569',
                                        borderRadius: 9999, fontSize: 11, fontWeight: 600, border: '1px solid #e2e8f0'
                                    }}>
                                        {modalidade.num_questoes} questões
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, color: '#718096' }}>
                                    {new Date(modalidade.data_criacao).toLocaleDateString()}
                                </td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                        <ActionBtn
                                            onClick={() => handleEdit(modalidade)}
                                            color="#1D5E24"
                                            hoverBg="#e8f5e9"
                                            title="Editar"
                                        >
                                            <FaRegEdit size={12} /> Editar
                                        </ActionBtn>
                                        <ActionBtn
                                            onClick={() => handleDeleteRequest(modalidade)}
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
                            <td colSpan="4" style={{ textAlign: 'center', padding: '48px 24px', color: '#718096', fontSize: 14 }}>
                                <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                                {searchQuery
                                    ? `Nenhuma modalidade encontrada para "${searchQuery}".`
                                    : 'Nenhuma modalidade cadastrada.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal de edição */}
            {editingModalidade && (
                <EditModal
                    show={showEditModal}
                    modalidade={editingModalidade}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditSave}
                />
            )}

            {/* Modal de confirmação de exclusão */}
            <ConfirmDeleteModal
                show={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                message={deletingModalidade ? `Tem certeza que deseja excluir a modalidade "${deletingModalidade.mod_ensino}"?` : ""}
                loading={deleteMutation.isPending}
            />
        </div>
    );
};

export default Table_Modalidades;