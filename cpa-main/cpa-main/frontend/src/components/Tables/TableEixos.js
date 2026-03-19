// src/components/Tables/TableEixos.js
import React, { useEffect, useState, useRef } from 'react';
import { Table, Dropdown, Accordion, Modal, Button, Spinner } from 'react-bootstrap';
import ButtonAdicionar from '../Buttons/Button_Adicionar';
import { IoSettingsSharp } from "react-icons/io5";
import { deletarEixo, getEixos, getEixoByNumero } from '../../services/eixosService';
import { getDimensoesByEixo, getDimensaoByNumero, deletarDimensao } from '../../services/dimensoesService';
import ModalUpdate from '../Modals/ModalUpdateEixo';
import ModalUpdateDimensao from '../Modals/ModalUpdateDimensao';
import ModalAddDimensao from '../Modals/ModalAddDimensao';
import { Toast } from 'primereact/toast';
import './Table.css';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";

// ── Modal de confirmação genérico ────────────────
function ConfirmModal({ show, onConfirm, onCancel, title, body, confirmLabel = 'Excluir', loading }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{body}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading} style={{ minWidth: 100 }}>
                    {loading
                        ? <><Spinner size="sm" animation="border" className="me-2" />Excluindo...</>
                        : confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const TableEixos = ({ updateTable, searchQuery = '', onSuccess }) => {
    const [data, setData] = useState([]);
    const [dimensoes, setDimensoes] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [showModalUpdateDimensao, setShowModalUpdateDimensao] = useState(false);
    const [showModalAddDimensao, setShowModalAddDimensao] = useState(false);
    const [currentEixoNumero, setCurrentEixoNumero] = useState(null);
    const [isEditingDimensao, setIsEditingDimensao] = useState(false);

    // estados do modal de confirmação
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({});
    const [confirmLoading, setConfirmLoading] = useState(false);

    const toast = useRef(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTable]);

    const fetchData = async () => {
        try {
            const eixos = await getEixos();
            setData(eixos || []);
        } catch (error) {
            showToast('error', 'Erro ao carregar eixos.');
        }
    };

    const showToast = (severity, detail) => {
        toast.current?.show({
            severity,
            summary: severity === 'error' ? 'Erro' : 'Sucesso',
            detail,
            life: 3000,
        });
    };

    // ── filtro de pesquisa ─────────────────────────
    const filteredData = data.filter(eixo => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        const matchEixo = (eixo.nome || '').toLowerCase().includes(q) ||
            String(eixo.numero).includes(q);
        // Verifica também nas dimensões já carregadas
        const matchDimensao = (dimensoes[eixo.numero] || []).some(d =>
            (d.nome || '').toLowerCase().includes(q) ||
            String(d.numero).includes(q)
        );
        return matchEixo || matchDimensao;
    });

    // ── edição ─────────────────────────────────────
    const handleEdit = async (item, isDimensao = false) => {
        try {
            if (isDimensao) {
                setIsEditingDimensao(true);
                const d = await getDimensaoByNumero(item.numero);
                setSelectedItem(d);
                setShowModalUpdateDimensao(true);
            } else {
                setIsEditingDimensao(false);
                const e = await getEixoByNumero(item.numero);
                setSelectedItem(e);
                setShowModalUpdate(true);
            }
        } catch (error) {
            showToast('error', `Erro ao carregar dados para edição.`);
        }
    };

    // ── exclusão com modal de confirmação ──────────
    const handleDelete = (item, isDimensao = false) => {
        setConfirmConfig({
            title: isDimensao ? 'Excluir Dimensão' : 'Excluir Eixo',
            body: (
                <p>
                    Tem certeza que deseja excluir{' '}
                    <strong>{item.numero} — {item.nome}</strong>?
                    {!isDimensao && (
                        <><br /><span className="text-muted small">Todas as dimensões associadas também serão excluídas.</span></>
                    )}
                    <br /><span className="text-muted small">Esta ação não pode ser desfeita.</span>
                </p>
            ),
            onConfirm: async () => {
                setConfirmLoading(true);
                try {
                    if (isDimensao) {
                        await deletarDimensao(item.numero);
                        setDimensoes(prev => {
                            const updated = { ...prev };
                            if (Array.isArray(updated[item.numero_eixos])) {
                                updated[item.numero_eixos] = updated[item.numero_eixos]
                                    .filter(d => d.numero !== item.numero);
                            }
                            return updated;
                        });
                        showToast('success', 'Dimensão excluída com sucesso.');
                    } else {
                        await deletarEixo(item.numero);
                        setData(prev => prev.filter(d => d.numero !== item.numero));
                        showToast('success', 'Eixo e suas dimensões excluídos com sucesso.');
                    }
                    setShowConfirm(false);
                } catch (error) {
                    showToast('error', 'Erro ao excluir. Tente novamente.');
                } finally {
                    setConfirmLoading(false);
                }
            },
        });
        setShowConfirm(true);
    };

    const handleUpdateSuccess = (message) => {
        showToast('success', message);
        setShowModalUpdate(false);
        setShowModalUpdateDimensao(false);
        setShowModalAddDimensao(false);
        fetchData();
        if (onSuccess) onSuccess(message);
    };

    const handleToggle = async (eixoNumero) => {
        if (!dimensoes[eixoNumero]) {
            try {
                const d = await getDimensoesByEixo(eixoNumero);
                setDimensoes(prev => ({ ...prev, [eixoNumero]: d }));
            } catch (error) {
                showToast('error', 'Erro ao carregar dimensões.');
            }
        }
    };

    const handleOpenAddDimensaoModal = (eixoNumero) => {
        setCurrentEixoNumero(eixoNumero);
        setShowModalAddDimensao(true);
    };

    return (
        <div className="eixos-accordion">
            <Toast ref={toast} />

            {filteredData.length === 0 && searchQuery ? (
                <p className="text-muted text-center py-3">
                    Nenhum eixo ou dimensão encontrado para "{searchQuery}".
                </p>
            ) : (
                <Accordion>
                    {filteredData.map((eixo) => (
                        <Accordion.Item eventKey={eixo.numero.toString()} key={eixo.numero}>
                            <Accordion.Header onClick={() => handleToggle(eixo.numero)}>
                                {eixo.numero} — {eixo.nome}
                            </Accordion.Header>
                            <Accordion.Body>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                    <ButtonAdicionar
                                        onClick={() => handleOpenAddDimensaoModal(eixo.numero)}
                                        variant="primary"
                                        style={{ marginRight: '10px' }}
                                    >
                                        +
                                    </ButtonAdicionar>
                                    <Dropdown>
                                        <Dropdown.Toggle
                                            as={IoSettingsSharp}
                                            id="dropdown-eixo"
                                            style={{ cursor: 'pointer', width: '30px', height: '30px' }}
                                        />
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleEdit(eixo)}>
                                                Editar eixo
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => handleDelete(eixo)}
                                                style={{ color: '#dc3545' }}
                                            >
                                                Excluir eixo
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                {dimensoes[eixo.numero] ? (
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>Nº</th>
                                                <th>Nome da dimensão</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(dimensoes[eixo.numero]) &&
                                                dimensoes[eixo.numero].map(dimensao => (
                                                    <tr key={dimensao.numero}>
                                                        <td>{dimensao.numero}</td>
                                                        <td>{dimensao.nome}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                                                                <FaRegEdit
                                                                    style={{ width: '22px', height: '22px' }}
                                                                    title="Editar dimensão"
                                                                    onClick={() => handleEdit(dimensao, true)}
                                                                />
                                                                <IoTrashOutline
                                                                    style={{ width: '22px', height: '22px' }}
                                                                    title="Excluir dimensão"
                                                                    onClick={() => handleDelete(dimensao, true)}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted small">
                                        Clique no eixo para carregar as dimensões.
                                    </p>
                                )}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}

            {/* Modais de edição */}
            {showModalUpdate && selectedItem && !isEditingDimensao && (
                <ModalUpdate
                    show={showModalUpdate}
                    handleClose={() => { setShowModalUpdate(false); fetchData(); }}
                    eixoData={selectedItem}
                    onSuccess={handleUpdateSuccess}
                />
            )}
            {showModalUpdateDimensao && selectedItem && isEditingDimensao && (
                <ModalUpdateDimensao
                    show={showModalUpdateDimensao}
                    handleClose={() => { setShowModalUpdateDimensao(false); fetchData(); }}
                    dimensaoData={selectedItem}
                    onSuccess={handleUpdateSuccess}
                />
            )}
            {showModalAddDimensao && currentEixoNumero && (
                <ModalAddDimensao
                    show={showModalAddDimensao}
                    handleClose={() => { setShowModalAddDimensao(false); fetchData(); }}
                    eixoNumero={currentEixoNumero}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {/* Modal de confirmação de exclusão */}
            <ConfirmModal
                show={showConfirm}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setShowConfirm(false)}
                title={confirmConfig.title}
                body={confirmConfig.body}
                loading={confirmLoading}
            />
        </div>
    );
};

export default TableEixos;