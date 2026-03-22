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

    // ── filtro ─────────────────────────────────────
    const filtered = admins.filter(a => {
        const q = searchQuery.toLowerCase();
        return (
            (a.email || '').toLowerCase().includes(q) ||
            (a.nome || '').toLowerCase().includes(q)
        );
    });

    // ── exclusão ───────────────────────────────────
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

    // ── edição ─────────────────────────────────────
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

            {loadingTable ? (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-2 text-muted">Carregando administradores...</p>
                </div>
            ) : (
                <Table striped>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map(admin => (
                                <tr key={admin.id}>
                                    <td>{admin.id}</td>
                                    <td>{admin.nome}</td>
                                    <td>{admin.email}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                                            <FaRegEdit
                                                style={{ width: '24px', height: '24px' }}
                                                title="Editar"
                                                onClick={() => handleUpdateAdmin(admin)}
                                            />
                                            <IoTrashOutline
                                                style={{ width: '24px', height: '24px' }}
                                                title="Remover"
                                                onClick={() => handleDeleteRequest(admin)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-3">
                                    {searchQuery
                                        ? `Nenhum admin encontrado para "${searchQuery}".`
                                        : 'Nenhum admin cadastrado.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

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