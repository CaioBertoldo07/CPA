// src/components/Tables/TableAdmins.js
import React, { useEffect, useState, useRef } from 'react';
import { Table, Modal, Button, Spinner } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import ModalAdmin from '../Modals/Modal_Admin';
import { getAdmins, deleteAdmin } from '../../services/adminService';
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";

// ── modal de confirmação ──────────────────────────
function ConfirmDeleteModal({ show, onConfirm, onCancel, admin, loading }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Excluir Administrador</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Tem certeza que deseja remover o administrador{' '}
                    <strong>{admin?.email}</strong>?
                </p>
                <p className="text-muted small">Esta ação não pode ser desfeita.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading} style={{ minWidth: 100 }}>
                    {loading
                        ? <><Spinner size="sm" animation="border" className="me-2" />Removendo...</>
                        : 'Remover'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const TableAdmins = ({ updateTable, searchQuery = '', onSuccess }) => {
    const [admins, setAdmins] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    // edição
    const [modalShow, setModalShow] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    // exclusão
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAdmin, setDeletingAdmin] = useState(null);
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

    const fetchAdmins = async () => {
        setLoadingTable(true);
        try {
            const data = await getAdmins();
            setAdmins(data || []);
        } catch (error) {
            showToast('error', 'Erro ao carregar administradores.');
        } finally {
            setLoadingTable(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTable]);

    // ── filtro ─────────────────────────────────────
    const filtered = admins.filter(a => {
        const q = searchQuery.toLowerCase();
        return (
            (a.email || '').toLowerCase().includes(q) ||
            (a.nome  || '').toLowerCase().includes(q)
        );
    });

    // ── exclusão ───────────────────────────────────
    const handleDeleteRequest = (admin) => {
        setDeletingAdmin(admin);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingAdmin) return;
        setDeletingLoading(true);
        try {
            await deleteAdmin(deletingAdmin.id);
            setAdmins(prev => prev.filter(a => a.id !== deletingAdmin.id));
            showToast('success', `Admin "${deletingAdmin.email}" removido com sucesso!`);
            if (onSuccess) onSuccess('Admin removido com sucesso!');
        } catch (error) {
            showToast('error', 'Erro ao remover admin. Tente novamente.');
        } finally {
            setDeletingLoading(false);
            setShowDeleteModal(false);
            setDeletingAdmin(null);
        }
    };

    // ── edição ─────────────────────────────────────
    const handleUpdateAdmin = (admin) => {
        setSelectedAdmin(admin);
        setModalShow(true);
    };

    const handleAdminSaved = (message) => {
        setModalShow(false);
        fetchAdmins();
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
                onCancel={() => { setShowDeleteModal(false); setDeletingAdmin(null); }}
                admin={deletingAdmin}
                loading={deletingLoading}
            />
        </div>
    );
};

export default TableAdmins;