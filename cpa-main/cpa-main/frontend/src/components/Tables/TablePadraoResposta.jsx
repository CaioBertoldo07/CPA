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

const SkeletonRow = () => (
    <tr>
        {[50, '100%', 80].map((w, i) => (
            <td key={i} style={{ padding: '14px 16px' }}>
                <div style={{
                    height: 12, width: w === '100%' ? '70%' : w, borderRadius: 6,
                    background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
                    backgroundSize: '400% 100%',
                    animation: 'skeletonPulse 1.4s ease infinite',
                }} />
            </td>
        ))}
    </tr>
);

const thStyle = {
    padding: '10px 16px', fontSize: 11, fontWeight: 600,
    color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px',
    textAlign: 'left', whiteSpace: 'nowrap',
    background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
};
const tdStyle = { padding: '13px 16px', color: '#1a202c', verticalAlign: 'middle', fontSize: 13 };

const ActionBtn = ({ onClick, color, hoverBg, title, children, disabled, variant = 'outline' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: 5, padding: variant === 'ghost' ? '5px' : '5px 12px',
            fontSize: 11, fontWeight: 600,
            background: 'transparent', color,
            border: variant === 'ghost' ? 'none' : `1.5px solid ${color}33`,
            borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 150ms', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
        {children}
    </button>
);

// ── Sub-componente para as alternativas de um padrão ──
const AlternativasTable = ({ padraoId, onEdit, onDelete }) => {
    const { data: dataAlternativas = [], isLoading, isError } = useGetAlternativasByPadraoRespostaIdQuery(padraoId);

    if (isLoading) return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</tbody>
        </table>
    );
    if (isError) return <div style={{ padding: 20, color: '#ef4444', fontSize: 13 }}>Erro ao carregar alternativas.</div>;

    if (dataAlternativas.length === 0) return (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Nenhuma alternativa cadastrada para este padrão.
        </div>
    );

    return (
        <div style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        <th style={{ ...thStyle, width: 60 }}>Id</th>
                        <th style={thStyle}>Alternativa</th>
                        <th style={{ ...thStyle, textAlign: 'right', width: 100 }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {dataAlternativas.map((alt, idx) => (
                        <tr key={alt.id} className="alt-row" style={{ borderBottom: idx < dataAlternativas.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 150ms' }}>
                            <td style={tdStyle}>
                                <span style={{
                                    fontFamily: 'monospace', fontSize: 11,
                                    background: '#f1f5f9', color: '#64748b',
                                    padding: '2px 6px', borderRadius: 4,
                                    border: '1px solid #e2e8f0', fontWeight: 600,
                                }}>
                                    #{alt.id}
                                </span>
                            </td>
                            <td style={{ ...tdStyle, fontWeight: 500 }}>{alt.descricao}</td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                    <ActionBtn onClick={() => onEdit(alt)} color="#4a5568" hoverBg="#f1f5f9" title="Editar" variant="ghost">
                                        <FaRegEdit size={13} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => onDelete(alt)} color="#ef4444" hoverBg="#fee2e2" title="Excluir" variant="ghost">
                                        <IoTrashOutline size={14} />
                                    </ActionBtn>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TablePadraoResposta = ({ searchQuery = '', onSuccess }) => {
    const { data: dataPadroes = [], isLoading: loadingTable, isError } = useGetPadraoRespostaQuery();
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

    useEffect(() => { if (isError) showToast('error', 'Erro ao carregar padrões.'); }, [isError]);

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
        <div style={{ padding: '0 4px' }}>
            <style>{`
                @keyframes skeletonPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .padrao-item { border:1px solid #e2e8f0 !important; border-radius:12px !important; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.06); margin-bottom:10px; transition:box-shadow 250ms; }
                .padrao-item:hover { box-shadow:0 4px 14px rgba(0,0,0,0.1) !important; }
                .padrao-item .accordion-header button { padding:16px 20px !important; background:#fff !important; color:#1a202c !important; font-weight:600 !important; box-shadow:none !important; border-bottom:1px solid transparent !important; transition:background 150ms !important; }
                .padrao-item .accordion-header button:not(.collapsed) { background:#f8fafc !important; border-bottom-color:#e2e8f0 !important; }
                .padrao-item .accordion-header button:focus { box-shadow:none !important; outline:none !important; }
                .alt-row:hover td { background:#f8fafc !important; }
            `}</style>
            <Toast ref={toast} />

            {loadingTable ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ height: 56, borderRadius: 12, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '400% 100%', animation: `skeletonPulse 1.4s ${i * 0.1}s ease infinite` }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 24px', color: '#718096' }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>📋</div>
                    <p style={{ margin: 0, fontSize: 14 }}>{searchQuery ? `Nenhum padrão encontrado para "${searchQuery}".` : 'Nenhum padrão cadastrado.'}</p>
                </div>
            ) : (
                <Accordion>
                    {filtered.map((padrao, idx) => (
                        <Accordion.Item
                            eventKey={padrao.id.toString()}
                            key={padrao.id}
                            className="padrao-item"
                            style={{ animation: `fadeInUp 350ms ${idx * 50}ms both` }}
                        >
                            <Accordion.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', minWidth: 0 }}>
                                    <span style={{ flexShrink: 0, padding: '3px 11px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>#{padrao.id}</span>
                                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{padrao.sigla}</span>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body style={{ padding: 0, background: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '14px 20px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Alternativas</span>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <ActionBtn
                                            onClick={() => { setCurrentPadraoNumero(padrao.id); setShowModalAddAlternativa(true); }}
                                            color="#1D5E24"
                                            hoverBg="#e8f5e9"
                                            title="Adicionar alternativa"
                                        >
                                            + Alternativa
                                        </ActionBtn>
                                        <ActionBtn onClick={() => handleEditPadrao(padrao)} color="#4a5568" hoverBg="#f1f5f9" title="Editar padrão">
                                            <FaRegEdit size={14} />
                                        </ActionBtn>
                                        <ActionBtn onClick={() => handleDeletePadrao(padrao)} color="#ef4444" hoverBg="#fee2e2" title="Excluir padrão">
                                            <IoTrashOutline size={15} />
                                        </ActionBtn>
                                    </div>
                                </div>

                                <AlternativasTable
                                    padraoId={padrao.id}
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