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
                message={deletingCategoria ? `Tem certeza que deseja excluir a categoria "${deletingCategoria.nome}"?` : ""}
                loading={deleteMutation.isPending}
            />
        </div>
    );
};

export default Table_Categorias;