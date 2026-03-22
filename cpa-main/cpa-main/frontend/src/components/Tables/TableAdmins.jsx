// src/components/Tables/TableAdmins.js
import React, { useEffect, useState, useRef } from 'react';
import { Table, Modal, Button, Spinner } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import ModalAdmin from '../Modals/Modal_Admin';
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';

import { useGetAdminsQuery } from '../../hooks/queries/useAdminQueries';
import { useDeleteAdminMutation } from '../../hooks/mutations/useAdminMutations';

const SkeletonRow = () => (
    <tr>
        {[50, '100%', '100%', 100].map((w, i) => (
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

const TableAdmins = ({ searchQuery = '', onSuccess }) => {
    const { data: admins = [], isLoading: loadingTable, isError } = useGetAdminsQuery();
    const deleteAdminMutation = useDeleteAdminMutation();

    const [modalShow, setModalShow] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAdmin, setDeletingAdmin] = useState(null);

    const toast = useRef(null);

    const showToast = (severity, detail) => {
        toast.current?.show({
            severity,
            summary: severity === 'error' ? 'Erro' : 'Sucesso',
            detail,
            life: 3000,
        });
    };

    useEffect(() => {
        if (isError) {
            showToast('error', 'Erro ao carregar administradores.');
        }
    }, [isError]);

    const filtered = admins.filter(a => {
        const q = searchQuery.toLowerCase();
        return (
            (a.email || '').toLowerCase().includes(q) ||
            (a.nome || '').toLowerCase().includes(q)
        );
    });

    const handleDeleteRequest = (admin) => {
        setDeletingAdmin(admin);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingAdmin) return;
        deleteAdminMutation.mutate(deletingAdmin.id, {
            onSuccess: () => {
                showToast('success', `Admin "${deletingAdmin.email}" removido com sucesso!`);
                setShowDeleteModal(false);
                setDeletingAdmin(null);
                if (onSuccess) onSuccess();
            },
            onError: (error) => {
                showToast('error', error.response?.data?.error || 'Erro ao remover admin. Tente novamente.');
            }
        });
    };

    const handleUpdateAdmin = (admin) => {
        setSelectedAdmin(admin);
        setModalShow(true);
    };

    const handleAdminSaved = (message) => {
        setModalShow(false);
        showToast('success', message || 'Admin salvo com sucesso!');
        if (onSuccess) onSuccess(message);
    };

    return (
        <div>
            <Toast ref={toast} />
            <style>{`.adm-row:hover td { background:#f8fafc !important; }`}</style>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Nome</th>
                        <th style={thStyle}>Email</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {loadingTable ? (
                        [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                    ) : filtered.length > 0 ? (
                        filtered.map(admin => (
                            <tr key={admin.id} className="adm-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 150ms' }}>
                                <td style={tdStyle}>
                                    <span style={{
                                        fontFamily: 'monospace', fontSize: 11,
                                        background: '#f1f5f9', color: '#64748b',
                                        padding: '2px 7px', borderRadius: 5,
                                        border: '1px solid #e2e8f0', fontWeight: 600,
                                    }}>
                                        #{admin.id}
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, fontWeight: 600 }}>{admin.nome}</td>
                                <td style={{ ...tdStyle, color: '#4a5568' }}>{admin.email}</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                        <ActionBtn
                                            onClick={() => handleUpdateAdmin(admin)}
                                            color="#1D5E24"
                                            hoverBg="#e8f5e9"
                                            title="Editar"
                                        >
                                            <FaRegEdit size={12} /> Editar
                                        </ActionBtn>
                                        <ActionBtn
                                            onClick={() => handleDeleteRequest(admin)}
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
                                <div style={{ fontSize: 36, marginBottom: 10 }}>👤</div>
                                {searchQuery
                                    ? `Nenhum admin encontrado para "${searchQuery}".`
                                    : 'Nenhum admin cadastrado.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <ModalAdmin
                show={modalShow}
                onHide={() => setModalShow(false)}
                admin={selectedAdmin}
                onSuccess={handleAdminSaved}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false)}
                message={deletingAdmin ? `Tem certeza que deseja remover o administrador "${deletingAdmin.email}"?` : ""}
                loading={deleteAdminMutation.isPending}
            />
        </div>
    );
};

export default TableAdmins;