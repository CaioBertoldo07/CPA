import React, { useEffect, useState, useRef } from 'react';
import { Accordion, Modal, Button, Spinner } from 'react-bootstrap';
import ModalUpdate from '../Modals/ModalUpdateEixo';
import ModalUpdateDimensao from '../Modals/ModalUpdateDimensao';
import ModalAddDimensao from '../Modals/ModalAddDimensao';
import { Toast } from 'primereact/toast';
import { FaRegEdit } from 'react-icons/fa';
import { IoTrashOutline } from 'react-icons/io5';
import { useGetEixosQuery } from '../../hooks/queries/useEixoQueries';
import { useDeleteEixoMutation } from '../../hooks/mutations/useEixoMutations';
import { useGetDimensoesByEixoQuery } from '../../hooks/queries/useDimensaoQueries';
import { useDeleteDimensaoMutation } from '../../hooks/mutations/useDimensaoMutations';

const SkeletonRow = () => (
    <tr>
        {[60, '100%', 90].map((w, i) => (
            <td key={i} style={{ padding: '16px 20px' }}>
                <div style={{
                    height: 14, width: w, borderRadius: 6,
                    background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
                    backgroundSize: '400% 100%',
                    animation: 'skeletonPulse 1.4s ease infinite',
                }} />
            </td>
        ))}
    </tr>
);

function ConfirmModal({ show, onConfirm, onCancel, title, body, loading }) {
    return (
        <Modal show={show} onHide={onCancel} centered size="sm">
            <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ fontSize: 13, color: '#4a5568', padding: '16px 20px' }}>{body}</Modal.Body>
            <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', gap: 8, padding: '12px 20px' }}>
                <Button variant="light" onClick={onCancel} disabled={loading} size="sm">Cancelar</Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading} size="sm" style={{ minWidth: 90 }}>
                    {loading ? <><Spinner size="sm" animation="border" className="me-1" />Excluindo...</> : 'Confirmar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const thStyle = {
    padding: '11px 20px',
    fontSize: 11, fontWeight: 600,
    color: '#718096', textTransform: 'uppercase',
    letterSpacing: '0.5px', textAlign: 'left',
    whiteSpace: 'nowrap', background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
};
const tdStyle = { padding: '15px 20px', color: '#1a202c', verticalAlign: 'middle', fontSize: 13 };
const actionBtn = (color = '#4a5568') => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 7,
    background: 'transparent', color, border: 'none', cursor: 'pointer',
    transition: 'background 150ms',
});

const DimensionList = ({ eixoNumero, onEdit, onDelete, searchQuery }) => {
    const { data: dimensoes = [], isLoading } = useGetDimensoesByEixoQuery(eixoNumero);

    if (isLoading) return [1, 2, 3].map(i => <SkeletonRow key={i} />);

    const filtered = dimensoes.filter(d => {
        const q = searchQuery.toLowerCase();
        return (d.nome || '').toLowerCase().includes(q) || String(d.numero).includes(q);
    });

    if (filtered.length === 0) return (
        <tr>
            <td colSpan={3} style={{ textAlign: 'center', padding: '28px 20px', color: '#94a3b8', fontSize: 13 }}>
                Nenhuma dimensão encontrada.
            </td>
        </tr>
    );

    return filtered.map((dimensao, di) => (
        <tr
            key={dimensao.numero}
            className="dim-row"
            style={{ borderBottom: di < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 150ms' }}
        >
            <td style={tdStyle}>
                <span style={{
                    fontFamily: 'monospace', fontSize: 12,
                    background: '#f8fafc', color: '#64748b',
                    padding: '3px 8px', borderRadius: 6,
                    border: '1px solid #e2e8f0', fontWeight: 600,
                }}>{dimensao.numero}</span>
            </td>
            <td style={{ ...tdStyle, fontWeight: 500, color: '#374151' }}>{dimensao.nome}</td>
            <td style={{ ...tdStyle, textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button onClick={() => onEdit(dimensao)} style={actionBtn('#4a5568')} title="Editar"><FaRegEdit size={13} /></button>
                    <button onClick={() => onDelete(dimensao)} style={actionBtn('#ef4444')} title="Excluir"><IoTrashOutline size={14} /></button>
                </div>
            </td>
        </tr>
    ));
};

const TableEixos = ({ searchQuery = '', onSuccess }) => {
    const { data: eixos = [], isLoading: loadingEixos, isError } = useGetEixosQuery();
    const deleteEixoMutation = useDeleteEixoMutation();
    const deleteDimensaoMutation = useDeleteDimensaoMutation();

    const [selectedItem, setSelectedItem] = useState(null);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [showModalUpdateDimensao, setShowModalUpdateDimensao] = useState(false);
    const [showModalAddDimensao, setShowModalAddDimensao] = useState(false);
    const [currentEixoNumero, setCurrentEixoNumero] = useState(null);
    const [isEditingDimensao, setIsEditingDimensao] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({});

    const toast = useRef(null);
    const showToast = (severity, detail) => toast.current?.show({ severity, summary: severity === 'error' ? 'Erro' : 'Sucesso', detail, life: 3000 });

    useEffect(() => { if (isError) showToast('error', 'Erro ao carregar eixos.'); }, [isError]);

    const filteredData = eixos.filter(eixo => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        return (eixo.nome || '').toLowerCase().includes(q) || String(eixo.numero).includes(q);
    });

    const handleEdit = (item, isDimensao = false) => {
        setSelectedItem(item);
        setIsEditingDimensao(isDimensao);
        if (isDimensao) setShowModalUpdateDimensao(true);
        else setShowModalUpdate(true);
    };

    const handleDelete = (item, isDimensao = false) => {
        setConfirmConfig({
            title: isDimensao ? 'Excluir Dimensão' : 'Excluir Eixo',
            body: isDimensao
                ? `Excluir a dimensão "${item.nome}"? Esta ação não pode ser desfeita.`
                : `Excluir o eixo "${item.nome}" e todas as suas dimensões? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                if (isDimensao) {
                    deleteDimensaoMutation.mutate(item.numero, {
                        onSuccess: () => { showToast('success', 'Dimensão excluída.'); setShowConfirm(false); },
                        onError: () => showToast('error', 'Erro ao excluir dimensão.')
                    });
                } else {
                    deleteEixoMutation.mutate(item.numero, {
                        onSuccess: () => { showToast('success', 'Eixo excluído.'); setShowConfirm(false); },
                        onError: () => showToast('error', 'Erro ao excluir eixo.')
                    });
                }
            },
        });
        setShowConfirm(true);
    };

    const handleUpdateSuccess = (msg) => {
        showToast('success', msg);
        setShowModalUpdate(false); setShowModalUpdateDimensao(false); setShowModalAddDimensao(false);
        onSuccess?.(msg);
    };

    return (
        <>
            <style>{`
                @keyframes skeletonPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .eixo-item { border:1px solid #e2e8f0 !important; border-radius:12px !important; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.06); margin-bottom:8px; transition:box-shadow 250ms; }
                .eixo-item:hover { box-shadow:0 4px 14px rgba(0,0,0,0.1) !important; }
                .eixo-item .accordion-header button { padding:16px 20px !important; background:#fff !important; color:#1a202c !important; font-weight:600 !important; box-shadow:none !important; border-bottom:1px solid transparent !important; transition:background 150ms !important; }
                .eixo-item .accordion-header button:not(.collapsed) { background:#f8fafc !important; border-bottom-color:#e2e8f0 !important; }
                .eixo-item .accordion-header button:focus { box-shadow:none !important; outline:none !important; }
                .eixo-item .accordion-button::after { flex-shrink:0; }
                .dim-row:hover td { background:#f8fafc !important; }
            `}</style>
            <Toast ref={toast} />

            {loadingEixos ? (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ height: 54, borderRadius: 12, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '400% 100%', animation: `skeletonPulse 1.4s ${i * 0.1}s ease infinite` }} />
                    ))}
                </div>
            ) : filteredData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 24px', color: '#718096' }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
                    <p style={{ margin: 0, fontSize: 14 }}>{searchQuery ? `Nenhum resultado para "${searchQuery}".` : 'Nenhum eixo cadastrado.'}</p>
                </div>
            ) : (
                <div style={{ padding: '12px 16px 16px' }}>
                    <Accordion>
                        {filteredData.map((eixo, idx) => (
                            <Accordion.Item eventKey={eixo.numero.toString()} key={eixo.numero} className="eixo-item" style={{ animation: `fadeInUp 350ms ${idx * 50}ms both` }}>
                                <Accordion.Header>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', minWidth: 0 }}>
                                        <span style={{ flexShrink: 0, padding: '3px 11px', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>Eixo {eixo.numero}</span>
                                        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eixo.nome}</span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body style={{ padding: 0, background: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '14px 20px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Dimensões</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => { setCurrentEixoNumero(eixo.numero); setShowModalAddDimensao(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 13px', fontSize: 12, fontWeight: 600, background: 'transparent', color: '#1D5E24', border: '1.5px solid #1D5E24', borderRadius: 8, cursor: 'pointer', transition: 'all 150ms' }} onMouseEnter={e => e.currentTarget.style.background = '#e8f5e9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>+ Dimensão</button>
                                            <button onClick={() => handleEdit(eixo)} style={{ ...actionBtn('#4a5568'), fontSize: 12 }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Editar eixo"><FaRegEdit size={14} /></button>
                                            <button onClick={() => handleDelete(eixo)} style={{ ...actionBtn('#ef4444') }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Excluir eixo"><IoTrashOutline size={15} /></button>
                                        </div>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                        <thead>
                                            <tr>
                                                <th style={{ ...thStyle, width: 80 }}>Nº</th>
                                                <th style={thStyle}>Nome da Dimensão</th>
                                                <th style={{ ...thStyle, textAlign: 'right', width: 100 }}>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <DimensionList
                                                eixoNumero={eixo.numero}
                                                onEdit={(dim) => handleEdit(dim, true)}
                                                onDelete={(dim) => handleDelete(dim, true)}
                                                searchQuery={searchQuery}
                                            />
                                        </tbody>
                                    </table>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </div>
            )}

            {showModalUpdate && selectedItem && !isEditingDimensao && (
                <ModalUpdate show handleClose={() => setShowModalUpdate(false)} eixoData={selectedItem} onSuccess={handleUpdateSuccess} />
            )}
            {showModalUpdateDimensao && selectedItem && isEditingDimensao && (
                <ModalUpdateDimensao show handleClose={() => setShowModalUpdateDimensao(false)} dimensaoData={selectedItem} onSuccess={handleUpdateSuccess} />
            )}
            {showModalAddDimensao && currentEixoNumero && (
                <ModalAddDimensao show handleClose={() => setShowModalAddDimensao(false)} eixoNumero={currentEixoNumero} onSuccess={handleUpdateSuccess} />
            )}
            <ConfirmModal show={showConfirm} onConfirm={confirmConfig.onConfirm} onCancel={() => setShowConfirm(false)} title={confirmConfig.title} body={confirmConfig.body} loading={deleteEixoMutation.isPending || deleteDimensaoMutation.isPending} />
        </>
    );
};

export default TableEixos;