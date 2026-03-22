// src/components/Tables/Table_Categorias.js
import React, { useEffect, useRef, useState } from "react";
import { useGetCategoriasQuery } from "../../hooks/queries/useCategoriaQueries";
import { useDeleteCategoriaMutation } from "../../hooks/mutations/useCategoriaMutations";
import { Table, Spinner } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ModalCategorias from '../Modals/Modal_Categorias';
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';

const SkeletonRow = () => (
    <tr>
        {[50, '100%', 120, 80].map((w, i) => (
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

const Table_Categorias = ({ searchQuery = '', onSuccess }) => {
    const { data: datacategorias = [], isLoading: loadingTable, isError } = useGetCategoriasQuery();
    const deleteMutation = useDeleteCategoriaMutation();

    const [modalShow, setModalShow] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCategoria, setDeletingCategoria] = useState(null);

    const toast = useRef(null);

    useEffect(() => { if (isError) showToast('error', 'Erro ao carregar categorias.'); }, [isError]);

    const showToast = (severity, detail) => {
        toast.current?.show({ severity, summary: severity === 'error' ? 'Erro' : 'Sucesso', detail, life: 3000 });
    };

    const filtered = datacategorias.filter(c =>
        (c.nome || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteRequest = (categoria) => {
        setDeletingCategoria(categoria);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCategoria) return;
        deleteMutation.mutate(deletingCategoria.id, {
            onSuccess: () => {
                showToast('success', `Categoria "${deletingCategoria.nome}" excluída com sucesso!`);
                if (onSuccess) onSuccess('Categoria excluída com sucesso!');
                setShowDeleteModal(false);
                setDeletingCategoria(null);
            },
            onError: () => showToast('error', 'Erro ao excluir categoria. Tente novamente.')
        });
    };

    const handleUpdateCategoria = (categoria) => {
        setSelectedCategoria(categoria);
        setModalShow(true);
    };

    const handleCategoriaSaved = (message) => {
        setModalShow(false);
        showToast('success', message || 'Categoria salva com sucesso!');
        if (onSuccess) onSuccess(message);
    };

    return (
        <div>
            <style>{`.cat-row:hover td { background:#f8fafc !important; }`}</style>
            <Toast ref={toast} />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Nome</th>
                        <th style={thStyle}>Data de Criação</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {loadingTable ? (
                        [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                    ) : filtered.length > 0 ? (
                        filtered.map(categoria => (
                            <tr key={categoria.id} className="cat-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 150ms' }}>
                                <td style={tdStyle}>
                                    <span style={{
                                        fontFamily: 'monospace', fontSize: 11,
                                        background: '#f1f5f9', color: '#64748b',
                                        padding: '2px 7px', borderRadius: 5,
                                        border: '1px solid #e2e8f0', fontWeight: 600,
                                    }}>
                                        #{categoria.id}
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, fontWeight: 500 }}>{categoria.nome}</td>
                                <td style={{ ...tdStyle, color: '#718096' }}>{new Date(categoria.data_criacao).toLocaleDateString()}</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                        <ActionBtn
                                            onClick={() => handleUpdateCategoria(categoria)}
                                            color="#1D5E24"
                                            hoverBg="#e8f5e9"
                                            title="Editar"
                                        >
                                            <FaRegEdit size={12} /> Editar
                                        </ActionBtn>
                                        <ActionBtn
                                            onClick={() => handleDeleteRequest(categoria)}
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
                                    ? `Nenhuma categoria encontrada para "${searchQuery}".`
                                    : 'Nenhuma categoria cadastrada.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <ModalCategorias
                show={modalShow}
                onHide={() => setModalShow(false)}
                categoria={selectedCategoria}
                onSuccess={handleCategoriaSaved}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setShowDeleteModal(false); setDeletingCategoria(null); }}
                message={deletingCategoria ? `Tem certeza que deseja excluir a categoria "${deletingCategoria.nome}"?` : ""}
                loading={deleteMutation.isPending}
            />
        </div>
    );
};

export default Table_Categorias;