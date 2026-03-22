// src/components/Tables/TablePadraoResposta.js
import React, { useState, useEffect, useRef } from 'react';
import { Table, Dropdown, Accordion, Modal, Button, Spinner } from 'react-bootstrap';
import { IoSettingsSharp } from "react-icons/io5";
import {
    getPadraoResposta,
    deletarPadraoResposta
} from '../../services/padraoRespostaService';
import {
    getAlternativasByPadraoRespostaId,
    deletarAlternativa
} from '../../services/alternativasServices';
import ModalUpdatePadraoResposta from '../Modals/ModalUpdatePadraoResposta';
import ModalAddAlternativa from '../Modals/ModalAddAlternativa';
import ModalUpdateAlternativa from '../Modals/ModalUpdateAlternativa';
import { Toast } from 'primereact/toast';
import './Table.css';
import ButtonAdicionar from '../Buttons/Button_Adicionar';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";

// ── modal de confirmação ──────────────────────────
function ConfirmDeleteModal({ show, onConfirm, onCancel, label, loading }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar exclusão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Tem certeza que deseja excluir <strong>{label}</strong>?</p>
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

const TablePadraoResposta = ({ updateTable, searchQuery = '', onSuccess }) => {
    const [data, setData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModalUpdatePadrao, setShowModalUpdatePadrao] = useState(false);
    const [showModalAddAlternativa, setShowModalAddAlternativa] = useState(false);
    const [showModalUpdateAlternativa, setShowModalUpdateAlternativa] = useState(false);
    const [alternativas, setAlternativas] = useState({});
    const [currentPadraoNumero, setCurrentPadraoNumero] = useState(null);

    // confirmação exclusão
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmLabel, setConfirmLabel] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const toast = useRef(null);

    const showToast = (severity, detail) => {
        toast.current?.show({
            severity,
            summary: severity === 'error' ? 'Erro' : 'Sucesso',
            detail,
            life: 3000,
        });
    };

    const fetchData = async () => {
        try {
            const d = await getPadraoResposta();
            setData(d || []);
        } catch (error) {
            showToast('error', 'Erro ao carregar padrões de resposta.');
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTable]);

    // ── filtro ─────────────────────────────────────
    const filtered = data.filter(p =>
        (p.sigla || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── helpers de confirmação ─────────────────────
    const openConfirm = (label, action) => {
        setConfirmLabel(label);
        setConfirmAction(() => action);
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setConfirmLoading(true);
        try {
            await confirmAction();
        } finally {
            setConfirmLoading(false);
            setShowConfirm(false);
        }
    };

    // ── handlers padrão ────────────────────────────
    const handleEditPadrao = (item) => {
        setSelectedItem(item);
        setShowModalUpdatePadrao(true);
    };

    const handleDeletePadrao = (item) => {
        openConfirm(`padrão "${item.sigla}" e todas as suas alternativas`, async () => {
            try {
                const alts = await getAlternativasByPadraoRespostaId(item.id);
                for (const alt of (alts || [])) {
                    await deletarAlternativa(alt.id);
                }
                await deletarPadraoResposta(item.id);
                setData(prev => prev.filter(d => d.id !== item.id));
                showToast('success', `Padrão "${item.sigla}" excluído com sucesso!`);
                if (onSuccess) onSuccess('Padrão excluído com sucesso!');
            } catch (e) {
                showToast('error', 'Erro ao excluir padrão de resposta.');
            }
        });
    };

    // ── handlers alternativa ───────────────────────
    const handleEditAlternativa = (alt) => {
        setSelectedItem(alt);
        setShowModalUpdateAlternativa(true);
    };

    const handleDeleteAlternativa = (alt) => {
        openConfirm(`alternativa "${alt.descricao}"`, async () => {
            try {
                await deletarAlternativa(alt.id);
                setAlternativas(prev => ({
                    ...prev,
                    [alt.id_padrao_resp]: (prev[alt.id_padrao_resp] || []).filter(a => a.id !== alt.id),
                }));
                showToast('success', 'Alternativa excluída com sucesso!');
            } catch (e) {
                showToast('error', 'Erro ao excluir alternativa.');
            }
        });
    };

    const handleUpdateSuccess = (message) => {
        showToast('success', message);
        setShowModalUpdatePadrao(false);
        setShowModalUpdateAlternativa(false);
        fetchData();
        if (onSuccess) onSuccess(message);
    };

    const handleToggle = async (id) => {
        if (!alternativas[id]) {
            try {
                const d = await getAlternativasByPadraoRespostaId(id);
                setAlternativas(prev => ({ ...prev, [id]: d }));
            } catch (error) {
                showToast('error', 'Erro ao carregar alternativas.');
            }
        }
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
                            <Accordion.Header onClick={() => handleToggle(padraoResposta.id)}>
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

                                {alternativas[padraoResposta.id] ? (
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Alternativa</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(alternativas[padraoResposta.id]) &&
                                                alternativas[padraoResposta.id].map(alt => (
                                                    <tr key={alt.id}>
                                                        <td>{alt.id}</td>
                                                        <td>{alt.descricao}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                                                                <FaRegEdit
                                                                    style={{ width: '22px', height: '22px' }}
                                                                    title="Editar"
                                                                    onClick={() => handleEditAlternativa(alt)}
                                                                />
                                                                <IoTrashOutline
                                                                    style={{ width: '22px', height: '22px' }}
                                                                    title="Excluir"
                                                                    onClick={() => handleDeleteAlternativa(alt)}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted small">
                                        Clique para carregar as alternativas.
                                    </p>
                                )}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}

            {/* Modais */}
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
                    onSuccess={(msg) => {
                        // Recarrega alternativas deste padrão
                        getAlternativasByPadraoRespostaId(currentPadraoNumero)
                            .then(d => setAlternativas(prev => ({ ...prev, [currentPadraoNumero]: d })))
                            .catch(() => {});
                        handleUpdateSuccess(msg || 'Alternativa adicionada com sucesso!');
                    }}
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
                onConfirm={handleConfirm}
                onCancel={() => setShowConfirm(false)}
                label={confirmLabel}
                loading={confirmLoading}
            />
        </div>
    );
};

export default TablePadraoResposta;