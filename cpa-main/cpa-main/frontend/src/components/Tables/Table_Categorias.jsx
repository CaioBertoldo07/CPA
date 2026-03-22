// src/components/Tables/Table_Categorias.js
import React, { useEffect, useRef, useState } from "react";
import { getCategorias, deleteCategoria } from "../../services/categoriasService";
import { Table, Modal, Button, Spinner } from "react-bootstrap";
import { Toast } from 'primereact/toast';
import ModalCategorias from "../Modals/Modal_Categorias";
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";

// ── modal de confirmação ──────────────────────────
function ConfirmDeleteModal({ show, onConfirm, onCancel, categoria, loading }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Excluir Categoria</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Tem certeza que deseja excluir a categoria{' '}
                    <strong>{categoria?.nome}</strong>?
                </p>
                <p className="text-muted small">Esta ação não pode ser desfeita.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading} style={{ minWidth: 100 }}>
                    {loading
                        ? <><Spinner size="sm" animation="border" className="me-2" />Excluindo...</>
                        : 'Excluir'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const Table_Categorias = ({ updateTable, searchQuery = '', onSuccess }) => {
    const [datacategorias, setDataCategorias] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    // edição
    const [modalShow, setModalShow] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);

    // exclusão
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCategoria, setDeletingCategoria] = useState(null);
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

    const fetchCategorias = async () => {
        setLoadingTable(true);
        try {
            const data = await getCategorias();
            setDataCategorias(data || []);
        } catch (error) {
            showToast('error', 'Erro ao carregar categorias.');
        } finally {
            setLoadingTable(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTable]);

    // ── filtro ─────────────────────────────────────
    const filtered = datacategorias.filter(c =>
        (c.nome || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── handlers exclusão ──────────────────────────
    const handleDeleteRequest = (categoria) => {
        setDeletingCategoria(categoria);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCategoria) return;
        setDeletingLoading(true);
        try {
            await deleteCategoria(deletingCategoria.id);
            setDataCategorias(prev => prev.filter(c => c.id !== deletingCategoria.id));
            showToast('success', `Categoria "${deletingCategoria.nome}" excluída com sucesso!`);
            if (onSuccess) onSuccess('Categoria excluída com sucesso!');
        } catch (error) {
            showToast('error', 'Erro ao excluir categoria. Tente novamente.');
        } finally {
            setDeletingLoading(false);
            setShowDeleteModal(false);
            setDeletingCategoria(null);
        }
    };

    // ── handlers edição ────────────────────────────
    const handleUpdateCategoria = (categoria) => {
        setSelectedCategoria(categoria);
        setModalShow(true);
    };

    const handleCategoriaSaved = (message) => {
        setModalShow(false);
        fetchCategorias(); // refetch após editar
        showToast('success', message || 'Categoria atualizada com sucesso!');
        if (onSuccess) onSuccess(message);
    };

    return (
        <div>
            <Toast ref={toast} />

            {loadingTable ? (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-2 text-muted">Carregando categorias...</p>
                </div>
            ) : (
                <Table striped>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nome</th>
                            <th>Data de Criação</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map(categoria => (
                                <tr key={categoria.id}>
                                    <td>{categoria.id}</td>
                                    <td>{categoria.nome}</td>
                                    <td>{new Date(categoria.data_criacao).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                                            <FaRegEdit
                                                style={{ width: '24px', height: '24px' }}
                                                title="Editar"
                                                onClick={() => handleUpdateCategoria(categoria)}
                                            />
                                            <IoTrashOutline
                                                style={{ width: '24px', height: '24px' }}
                                                title="Excluir"
                                                onClick={() => handleDeleteRequest(categoria)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-3">
                                    {searchQuery
                                        ? `Nenhuma categoria encontrada para "${searchQuery}".`
                                        : 'Nenhuma categoria cadastrada.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

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
                categoria={deletingCategoria}
                loading={deletingLoading}
            />
        </div>
    );
};

export default Table_Categorias;