// src/components/Tables/Table_Modalidades.js
import React, { useState, useEffect, useRef } from 'react';
import { Table, Modal, Button, Spinner } from 'react-bootstrap';
import './Table.css';
import EditModal from '../Modals/ModalUpdateModalidades';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { Toast } from 'primereact/toast';
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';

import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useDeleteModalidadeMutation } from '../../hooks/mutations/useModalidadeMutations';

const Table_Modalidades = ({ searchQuery = '', onSuccess }) => {
    const { data: modalidades = [], isLoading: loading, isError } = useGetModalidadesQuery();
    const deleteMutation = useDeleteModalidadeMutation();

    const [editingModalidade, setEditingModalidade] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingModalidade, setDeletingModalidade] = useState(null);

    const toast = useRef(null);

    useEffect(() => { if (isError) showToast('error', 'Erro ao carregar modalidades.'); }, [isError]);

    const showToast = (severity, detail) => {
        toast.current?.show({ severity, summary: severity === 'error' ? 'Erro' : 'Sucesso', detail, life: 3000 });
    };

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
        showToast('success', message || 'Modalidade atualizada com sucesso!');
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
                showToast('success', `Modalidade "${deletingModalidade.mod_ensino}" excluída com sucesso!`);
                if (onSuccess) onSuccess('Modalidade excluída com sucesso!');
                setShowDeleteModal(false);
                setDeletingModalidade(null);
            },
            onError: () => showToast('error', 'Erro ao excluir modalidade. Tente novamente.')
        });
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
                message={deletingModalidade ? `Tem certeza que deseja excluir a modalidade "${deletingModalidade.mod_ensino}"?` : ""}
                loading={deleteMutation.isPending}
            />
        </div>
    );
};

export default Table_Modalidades;