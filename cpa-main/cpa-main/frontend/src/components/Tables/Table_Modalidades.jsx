// src/components/Tables/Table_Modalidades.js
import React, { useState, useEffect, useRef } from 'react';
import { Table, Modal, Button, Spinner } from 'react-bootstrap';
import './Table.css';
import EditModal from '../Modals/ModalUpdateModalidades';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { Toast } from 'primereact/toast';

import {
    getModalidades,
    deleteModalidades
} from '../../services/modalidadesService';

// ────────────────────────────────────────────────
// Modal de confirmação reutilizável
// ────────────────────────────────────────────────
function ConfirmDeleteModal({ show, onConfirm, onCancel, modalidade, loading }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar exclusão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Tem certeza que deseja excluir a modalidade{' '}
                    <strong>{modalidade?.mod_ensino}</strong>?
                </p>
                <p className="text-muted small">Esta ação não pode ser desfeita.</p>
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

// ────────────────────────────────────────────────
// Tabela principal
// ────────────────────────────────────────────────
const Table_Modalidades = ({ searchQuery = '', updateTable, onSuccess }) => {
    const [modalidades, setModalidades] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado do modal de edição
    const [editingModalidade, setEditingModalidade] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Estado do modal de confirmação de exclusão
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingModalidade, setDeletingModalidade] = useState(null);
    const [deletingLoading, setDeletingLoading] = useState(false);

    const toast = useRef(null);

    // ── busca na API ──────────────────────────────
    const fetchModalidades = async () => {
        setLoading(true);
        try {
            const response = await getModalidades();
            setModalidades(response || []);
        } catch (error) {
            console.error("Erro ao buscar modalidades:", error);
            setModalidades([]);
            showToast('error', 'Erro ao carregar modalidades.');
        } finally {
            setLoading(false);
        }
    };

    // Re-busca sempre que updateTable mudar (pai sinalizou nova operação)
    useEffect(() => {
        fetchModalidades();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTable]);

    // ── helpers ───────────────────────────────────
    const showToast = (severity, detail) => {
        toast.current?.show({
            severity,
            summary: severity === 'error' ? 'Erro' : 'Sucesso',
            detail,
            life: 3000
        });
    };

    // ── filtro de pesquisa ────────────────────────
    const filtered = modalidades.filter(m => {
        const q = searchQuery.toLowerCase();
        return (
            (m.mod_ensino || '').toLowerCase().includes(q) ||
            (m.mod_oferta || '').toLowerCase().includes(q)
        );
    });

    // ── handlers de edição ────────────────────────
    const handleEdit = (modalidade) => {
        setEditingModalidade(modalidade);
        setShowEditModal(true);
    };

    const handleEditSave = (updatedModalidade) => {
        // Atualiza localmente e notifica o pai
        setModalidades(prev =>
            prev.map(m => m.id === updatedModalidade.id ? { ...m, ...updatedModalidade } : m)
        );
        setShowEditModal(false);
        showToast('success', 'Modalidade atualizada com sucesso!');
        if (onSuccess) onSuccess('Modalidade atualizada com sucesso!');
    };

    // ── handlers de exclusão ─────────────────────
    const handleDeleteRequest = (modalidade) => {
        setDeletingModalidade(modalidade);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingModalidade) return;
        setDeletingLoading(true);
        try {
            await deleteModalidades(deletingModalidade.id);
            // Remove localmente sem precisar rebuscar
            setModalidades(prev => prev.filter(m => m.id !== deletingModalidade.id));
            showToast('success', `Modalidade "${deletingModalidade.mod_ensino}" excluída com sucesso!`);
            if (onSuccess) onSuccess('Modalidade excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar modalidade:', error);
            showToast('error', 'Erro ao excluir modalidade. Tente novamente.');
        } finally {
            setDeletingLoading(false);
            setShowDeleteModal(false);
            setDeletingModalidade(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeletingModalidade(null);
    };

    // ── render ────────────────────────────────────
    return (
        <div>
            <Toast ref={toast} />

            {loading ? (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-2 text-muted">Carregando modalidades...</p>
                </div>
            ) : (
                <Table striped>
                    <thead>
                        <tr className="tr">
                            <th>Modalidade de ensino</th>
                            <th>Num. questões</th>
                            <th>Data de criação</th>
                            <th>Opções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((modalidade, index) => (
                                <tr key={modalidade.id ?? index}>
                                    <td className="td">{modalidade.mod_ensino}</td>
                                    <td className="td">{modalidade.num_questoes}</td>
                                    <td className="td">
                                        {new Date(modalidade.data_criacao).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                                            <FaRegEdit
                                                style={{ width: '24px', height: '24px' }}
                                                title="Editar"
                                                onClick={() => handleEdit(modalidade)}
                                            />
                                            <IoTrashOutline
                                                style={{ width: '24px', height: '24px' }}
                                                title="Excluir"
                                                onClick={() => handleDeleteRequest(modalidade)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-3">
                                    {searchQuery
                                        ? `Nenhuma modalidade encontrada para "${searchQuery}".`
                                        : 'Nenhuma modalidade cadastrada.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

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
                modalidade={deletingModalidade}
                loading={deletingLoading}
            />
        </div>
    );
};

export default Table_Modalidades;