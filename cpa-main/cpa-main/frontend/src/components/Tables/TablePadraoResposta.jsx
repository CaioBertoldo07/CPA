// src/components/Tables/TablePadraoResposta.js
import React, { useState, useEffect, useRef } from 'react';
import { Table, Dropdown, Accordion, Modal, Button, Spinner } from 'react-bootstrap';
import { IoSettingsSharp, IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from 'react-icons/fa';
import { Toast } from 'primereact/toast';
import ModalUpdatePadraoResposta from '../Modals/ModalUpdatePadraoResposta';
import ModalAddAlternativa from '../Modals/ModalAddAlternativa';
import ModalUpdateAlternativa from '../Modals/ModalUpdateAlternativa';
import ButtonAdicionar from '../Buttons/Button_Adicionar';
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';
import { useGetPadraoRespostaQuery } from '../../hooks/queries/usePadraoRespostaQueries';
import { useDeletePadraoRespostaMutation } from '../../hooks/mutations/usePadraoRespostaMutations';
import { useGetAlternativasByPadraoRespostaIdQuery } from '../../hooks/queries/useAlternativaQueries';
import { useDeleteAlternativaMutation } from '../../hooks/mutations/useAlternativaMutations';
import { getAlternativasByPadraoRespostaId } from '../../api/alternativas';

// ── Sub-componente para as alternativas de um padrão ──
const AlternativasTable = ({ padraoId, onEdit, onDelete }) => {
    const { data: dataAlternativas = [], isLoading, isError } = useGetAlternativasByPadraoRespostaIdQuery(padraoId);

    if (isLoading) return <Spinner size="sm" animation="border" variant="success" />;
    if (isError) return <p className="text-danger small">Erro ao carregar alternativas.</p>;

    return (
        <Table striped>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Alternativa</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {dataAlternativas.map(alt => (
                    <tr key={alt.id}>
                        <td>{alt.id}</td>
                        <td>{alt.descricao}</td>
                        <td>
                            <div style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                                <FaRegEdit
                                    style={{ width: '22px', height: '22px' }}
                                    title="Editar"
                                    onClick={() => onEdit(alt)}
                                />
                                <IoTrashOutline
                                    style={{ width: '22px', height: '22px' }}
                                    title="Excluir"
                                    onClick={() => onDelete(alt)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

const TablePadraoResposta = ({ searchQuery = '', onSuccess }) => {
    const { data: dataPadroes = [], isLoading: loadingTable } = useGetPadraoRespostaQuery();
    const deletePadraoMutation = useDeletePadraoRespostaMutation();
    const deleteAlternativaMutation = useDeleteAlternativaMutation();

    const [selectedItem, setSelectedItem] = useState(null);
    const [showModalUpdatePadrao, setShowModalUpdatePadrao] = useState(false);
    const [showModalAddAlternativa, setShowModalAddAlternativa] = useState(false);
    const [showModalUpdateAlternativa, setShowModalUpdateAlternativa] = useState(false);
    const [currentPadraoNumero, setCurrentPadraoNumero] = useState(null);

    // confirmação exclusão
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmLabel, setConfirmLabel] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    const toast = useRef(null);

    const showToast = (severity, detail) => {
        toast.current?.show({ severity, summary: severity === 'error' ? 'Erro' : 'Sucesso', detail, life: 3000 });
    };

    // ── filtro ─────────────────────────────────────
    const filtered = dataPadroes.filter(p =>
        (p.sigla || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── handlers padrão ────────────────────────────
    const handleEditPadrao = (item) => {
        setSelectedItem(item);
        setShowModalUpdatePadrao(true);
    };

    const handleDeletePadrao = (item) => {
        setConfirmLabel(`padrão "${item.sigla}" e todas as suas alternativas`);
        setConfirmAction(() => async () => {
            try {
                // Deleta alternativas primeiro (limpeza necessária no backend?)
                const alts = await getAlternativasByPadraoRespostaId(item.id);
                for (const alt of (alts || [])) {
                    await deleteAlternativaMutation.mutateAsync(alt.id);
                }
                await deletePadraoMutation.mutateAsync(item.id);
                showToast('success', `Padrão "${item.sigla}" excluído com sucesso!`);
                setShowConfirm(false);
                if (onSuccess) onSuccess('Padrão excluído com sucesso!');
            } catch (e) {
                showToast('error', 'Erro ao excluir padrão de resposta.');
            }
        });
        setShowConfirm(true);
    };

    // ── handlers alternativa ───────────────────────
    const handleEditAlternativa = (alt) => {
        setSelectedItem(alt);
        setShowModalUpdateAlternativa(true);
    };

    const handleDeleteAlternativa = (alt) => {
        setConfirmLabel(`alternativa "${alt.descricao}"`);
        setConfirmAction(() => () => {
            deleteAlternativaMutation.mutate(alt.id, {
                onSuccess: () => {
                    showToast('success', 'Alternativa excluída com sucesso!');
                    setShowConfirm(false);
                },
                onError: () => showToast('error', 'Erro ao excluir alternativa.')
            });
        });
        setShowConfirm(true);
    };

    const handleUpdateSuccess = (message) => {
        showToast('success', message);
        setShowModalUpdatePadrao(false);
        setShowModalUpdateAlternativa(false);
        if (onSuccess) onSuccess(message);
    };

    return (
        <div className="eixos-accordion">
            <Toast ref={toast} />

            {filtered.length === 0 && searchQuery ? (
                <p className="text-muted text-center py-3">
                    Nenhum padrão encontrado para "{searchQuery}".
                </p>
            ) : (
                <Accordion>
                    {filtered.map(padraoResposta => (
                        <Accordion.Item
                            eventKey={padraoResposta.id.toString()}
                            key={padraoResposta.id}
                        >
                            <Accordion.Header>
                                {padraoResposta.id} — {padraoResposta.sigla}
                            </Accordion.Header>
                            <Accordion.Body>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                    <ButtonAdicionar
                                        onClick={() => { setCurrentPadraoNumero(padraoResposta.id); setShowModalAddAlternativa(true); }}
                                        style={{ marginRight: '10px' }}
                                    >
                                        +
                                    </ButtonAdicionar>
                                    <Dropdown>
                                        <Dropdown.Toggle
                                            as={IoSettingsSharp}
                                            id="dropdown-padrao"
                                            style={{ cursor: 'pointer', width: '30px', height: '30px' }}
                                        />
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleEditPadrao(padraoResposta)}>
                                                Editar padrão
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => handleDeletePadrao(padraoResposta)}
                                                style={{ color: '#dc3545' }}
                                            >
                                                Excluir padrão
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                <AlternativasTable
                                    padraoId={padraoResposta.id}
                                    onEdit={handleEditAlternativa}
                                    onDelete={handleDeleteAlternativa}
                                />
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}

            {showModalUpdatePadrao && selectedItem && (
                <ModalUpdatePadraoResposta
                    show={showModalUpdatePadrao}
                    handleClose={() => setShowModalUpdatePadrao(false)}
                    padraoData={selectedItem}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showModalAddAlternativa && currentPadraoNumero !== null && (
                <ModalAddAlternativa
                    show={showModalAddAlternativa}
                    handleClose={() => setShowModalAddAlternativa(false)}
                    paraoNumero={currentPadraoNumero}
                    onSuccess={(msg) => handleUpdateSuccess(msg || 'Alternativa adicionada com sucesso!')}
                />
            )}

            {showModalUpdateAlternativa && selectedItem && (
                <ModalUpdateAlternativa
                    show={showModalUpdateAlternativa}
                    handleClose={() => setShowModalUpdateAlternativa(false)}
                    paraoNumero={currentPadraoNumero}
                    onSuccess={handleUpdateSuccess}
                    alternativa={selectedItem}
                />
            )}

            <ConfirmDeleteModal
                show={showConfirm}
                onConfirm={confirmAction}
                onCancel={() => setShowConfirm(false)}
                message={`Tem certeza que deseja excluir ${confirmLabel}?`}
                loading={deletePadraoMutation.isPending || deleteAlternativaMutation.isPending}
            />
        </div>
    );
};

export default TablePadraoResposta;