import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa6';
import { IoEyeOutline } from 'react-icons/io5';
import { BsUpload } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import {
    getAvaliacoes, enviarAvaliacao,
    deletarAvaliacaoById, prorrogarAvaliacaoById,
} from '../../services/avaliacoesService';

const STATUS_MAP = {
    1: { label: 'Rascunho',  bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    2: { label: 'Enviada',   bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    3: { label: 'Encerrada', bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP[1];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 9999,
            background: s.bg, color: s.color,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.4px',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
            {s.label}
        </span>
    );
};

const SkeletonRow = () => (
    <tr>
        {[50, 120, 70, 55, 80, 80, 90, 200].map((w, i) => (
            <td key={i} style={{ padding: '15px 16px' }}>
                <div style={{
                    height: 13, width: w, borderRadius: 6,
                    background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
                    backgroundSize: '400% 100%',
                    animation: 'skeletonPulse 1.4s ease infinite',
                }} />
            </td>
        ))}
    </tr>
);

function ConfirmModal({ show, onConfirm, onCancel, title, body, confirmLabel, confirmVariant = 'primary', loading }) {
    return (
        <Modal show={show} onHide={onCancel} centered size="sm">
            <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ fontSize: 13, color: '#4a5568', padding: '16px 20px' }}>{body}</Modal.Body>
            <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', gap: 8, padding: '12px 20px' }}>
                <Button variant="light" onClick={onCancel} disabled={loading} size="sm">Cancelar</Button>
                <Button variant={confirmVariant} onClick={onConfirm} disabled={loading} size="sm" style={{ minWidth: 90 }}>
                    {loading
                        ? <><Spinner size="sm" animation="border" className="me-1" />Aguarde...</>
                        : confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const fmt = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const thStyle = {
    padding: '11px 16px', fontSize: 11, fontWeight: 600,
    color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px',
    textAlign: 'left', whiteSpace: 'nowrap',
    background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
};
const tdStyle = { padding: '14px 16px', color: '#1a202c', verticalAlign: 'middle', fontSize: 13 };

const pagBtn = {
    width: 30, height: 30, borderRadius: 7,
    border: '1px solid #e2e8f0', background: 'transparent',
    color: '#4a5568', fontSize: 13, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 150ms',
};

const ITEMS_PER_PAGE = 10;

const Table_Avaliacao = ({ filtroStatus, searchQuery = '', refreshTable }) => {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [loadingEnviarId, setLoadingEnviarId] = useState(null);
    const [loadingExcluirId, setLoadingExcluirId] = useState(null);
    const [showEnviar, setShowEnviar] = useState(false);
    const [showExcluir, setShowExcluir] = useState(false);
    const [showProrrogar, setShowProrrogar] = useState(false);
    const [avaliacaoAlvo, setAvaliacaoAlvo] = useState(null);
    const [novaDataFim, setNovaDataFim] = useState('');
    const [loadingProrrogar, setLoadingProrrogar] = useState(false);
    const toast = useRef(null);
    const navigate = useNavigate();

    const fetchAvaliacoes = async () => {
        setLoading(true);
        try {
            setAvaliacoes((await getAvaliacoes()) || []);
            setPagina(1);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar avaliações.', life: 4000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAvaliacoes(); }, [refreshTable]);
    useEffect(() => { setPagina(1); }, [filtroStatus, searchQuery]);

    const showToast = (sev, msg) =>
        toast.current?.show({ severity: sev, summary: sev === 'error' ? 'Erro' : 'Sucesso', detail: msg, life: 4000 });

    const filtered = avaliacoes
        .filter(a => filtroStatus ? a.status === filtroStatus : true)
        .filter(a => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return String(a.id).includes(q)
                || (a.periodo_letivo || '').toLowerCase().includes(q)
                || (a.ano || '').toLowerCase().includes(q)
                || (a.modalidades || []).some(m => (m.mod_ensino || '').toLowerCase().includes(q));
        });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);

    const handleEnviarConfirm = async () => {
        setLoadingEnviarId(avaliacaoAlvo.id);
        try {
            await enviarAvaliacao(avaliacaoAlvo.id);
            showToast('success', 'Avaliação enviada com sucesso.');
            setShowEnviar(false);
            fetchAvaliacoes();
        } catch (e) {
            showToast('error', e.error || 'Erro ao enviar.');
        } finally {
            setLoadingEnviarId(null);
        }
    };

    const handleExcluirConfirm = async () => {
        setLoadingExcluirId(avaliacaoAlvo.id);
        try {
            await deletarAvaliacaoById(avaliacaoAlvo.id);
            showToast('success', 'Avaliação excluída.');
            setShowExcluir(false);
            fetchAvaliacoes();
        } catch (e) {
            showToast('error', e.error || 'Erro ao excluir.');
        } finally {
            setLoadingExcluirId(null);
        }
    };

    const handleProrrogarConfirm = async () => {
        if (!novaDataFim) { showToast('error', 'Informe a nova data.'); return; }
        setLoadingProrrogar(true);
        try {
            await prorrogarAvaliacaoById(avaliacaoAlvo.id, novaDataFim);
            showToast('success', 'Avaliação prorrogada.');
            setShowProrrogar(false);
            fetchAvaliacoes();
        } catch (e) {
            showToast('error', e.error || 'Erro ao prorrogar.');
        } finally {
            setLoadingProrrogar(false);
        }
    };

    const ActionBtn = ({ onClick, color, hoverBg, title, children, disabled }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 4, padding: '5px 10px',
                fontSize: 11, fontWeight: 600,
                background: 'transparent', color,
                border: `1.5px solid ${color}33`,
                borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 150ms', whiteSpace: 'nowrap',
                width: '100%',   // ocupa toda a célula do grid
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
            {children}
        </button>
    );

    return (
        <>
            <style>{`
                @keyframes skeletonPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                .av-row:hover td { background:#f8fafc !important; }
            `}</style>
            <Toast ref={toast} />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        {[
                            ['Código', 'left'],
                            ['Modalidades', 'left'],
                            ['Período', 'left'],
                            ['Ano', 'left'],
                            ['Início', 'left'],
                            ['Fim', 'left'],
                            ['Status', 'left'],
                            ['Ações', 'right'],
                        ].map(([h, a]) => (
                            <th key={h} style={{ ...thStyle, textAlign: a }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                    ) : paginated.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px', color: '#718096', fontSize: 14 }}>
                                <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                                {searchQuery
                                    ? `Nenhuma avaliação para "${searchQuery}".`
                                    : 'Nenhuma avaliação encontrada.'}
                            </td>
                        </tr>
                    ) : paginated.map(item => (
                        <tr
                            key={item.id}
                            className="av-row"
                            style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 150ms' }}
                        >
                            {/* Código */}
                            <td style={tdStyle}>
                                <span style={{
                                    fontFamily: 'monospace', fontSize: 11,
                                    background: '#f1f5f9', color: '#64748b',
                                    padding: '2px 7px', borderRadius: 5,
                                    border: '1px solid #e2e8f0', fontWeight: 600,
                                }}>
                                    #{item.id}
                                </span>
                            </td>

                            {/* Modalidades */}
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {(item.modalidades || []).map((m, i) => (
                                        <span key={i} style={{
                                            padding: '2px 8px',
                                            background: '#f1f5f9', color: '#4a5568',
                                            borderRadius: 9999, fontSize: 11, fontWeight: 500,
                                            border: '1px solid #e2e8f0',
                                        }}>
                                            {m.mod_ensino}
                                        </span>
                                    ))}
                                    {(!item.modalidades || item.modalidades.length === 0) && (
                                        <span style={{ color: '#94a3b8' }}>—</span>
                                    )}
                                </div>
                            </td>

                            {/* Período */}
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{item.periodo_letivo || '—'}</td>

                            {/* Ano */}
                            <td style={tdStyle}>{item.ano || '—'}</td>

                            {/* Início */}
                            <td style={{ ...tdStyle, color: '#718096' }}>{fmt(item.data_inicio)}</td>

                            {/* Fim */}
                            <td style={{ ...tdStyle, color: '#718096' }}>{fmt(item.data_fim)}</td>

                            {/* Status */}
                            <td style={tdStyle}>
                                <StatusBadge status={item.status} />
                            </td>

                            {/* Ações — grid de 3 colunas fixas para alinhar todas as linhas */}
                            <td style={{ ...tdStyle, width: 230, minWidth: 230 }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '68px 100px 36px',
                                    gap: 5,
                                    alignItems: 'center',
                                }}>
                                    {/* Col 1: Ver — sempre presente */}
                                    <ActionBtn
                                        onClick={() => navigate(`/relatorio/${item.id}`)}
                                        color="#1D5E24"
                                        hoverBg="#e8f5e9"
                                        title="Ver relatório"
                                    >
                                        <IoEyeOutline size={12} /> Ver
                                    </ActionBtn>

                                    {/* Col 2: Enviar | Prorrogar | placeholder */}
                                    {item.status === 1 ? (
                                        <ActionBtn
                                            onClick={() => { setAvaliacaoAlvo(item); setShowEnviar(true); }}
                                            color="#2563eb"
                                            hoverBg="#dbeafe"
                                            disabled={loadingEnviarId === item.id}
                                        >
                                            <BsUpload size={11} /> Enviar
                                        </ActionBtn>
                                    ) : item.status === 2 ? (
                                        <ActionBtn
                                            onClick={() => { setAvaliacaoAlvo(item); setNovaDataFim(''); setShowProrrogar(true); }}
                                            color="#7c3aed"
                                            hoverBg="#ede9fe"
                                        >
                                            <BsUpload size={11} /> Prorrogar
                                        </ActionBtn>
                                    ) : (
                                        <span /> // placeholder — mantém o grid alinhado
                                    )}

                                    {/* Col 3: Lixeira | placeholder */}
                                    {item.status === 1 ? (
                                        <ActionBtn
                                            onClick={() => { setAvaliacaoAlvo(item); setShowExcluir(true); }}
                                            color="#ef4444"
                                            hoverBg="#fee2e2"
                                            disabled={loadingExcluirId === item.id}
                                        >
                                            <FaTrash size={11} />
                                        </ActionBtn>
                                    ) : (
                                        <span /> // placeholder
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Paginação */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderTop: '1px solid #f1f5f9',
                }}>
                    <span style={{ fontSize: 12, color: '#718096' }}>
                        {((pagina - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(pagina * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button
                            onClick={() => setPagina(p => p - 1)}
                            disabled={pagina === 1}
                            style={{ ...pagBtn, opacity: pagina === 1 ? 0.4 : 1 }}
                        >‹</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPagina(i + 1)}
                                style={{
                                    ...pagBtn,
                                    background: pagina === i + 1 ? '#1D5E24' : 'transparent',
                                    color: pagina === i + 1 ? '#fff' : '#4a5568',
                                    fontWeight: pagina === i + 1 ? 700 : 400,
                                    borderColor: pagina === i + 1 ? '#1D5E24' : '#e2e8f0',
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPagina(p => p + 1)}
                            disabled={pagina === totalPages}
                            style={{ ...pagBtn, opacity: pagina === totalPages ? 0.4 : 1 }}
                        >›</button>
                    </div>
                </div>
            )}

            {/* Modal — Enviar */}
            <ConfirmModal
                show={showEnviar}
                onConfirm={handleEnviarConfirm}
                onCancel={() => setShowEnviar(false)}
                title="Enviar Avaliação"
                body={
                    <p style={{ margin: 0 }}>
                        Deseja enviar a avaliação <strong>#{avaliacaoAlvo?.id}</strong> ({avaliacaoAlvo?.periodo_letivo})?
                        Após enviada, não poderá ser editada.
                    </p>
                }
                confirmLabel="Enviar"
                confirmVariant="success"
                loading={loadingEnviarId === avaliacaoAlvo?.id}
            />

            {/* Modal — Excluir */}
            <ConfirmModal
                show={showExcluir}
                onConfirm={handleExcluirConfirm}
                onCancel={() => setShowExcluir(false)}
                title="Excluir Avaliação"
                body={
                    <p style={{ margin: 0 }}>
                        Tem certeza que deseja excluir a avaliação <strong>#{avaliacaoAlvo?.id}</strong>?
                        Esta ação não pode ser desfeita.
                    </p>
                }
                confirmLabel="Excluir"
                confirmVariant="danger"
                loading={loadingExcluirId === avaliacaoAlvo?.id}
            />

            {/* Modal — Prorrogar */}
            <Modal
                show={showProrrogar}
                onHide={() => !loadingProrrogar && setShowProrrogar(false)}
                centered
                size="sm"
            >
                <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                    <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Prorrogar Avaliação</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '16px 20px', fontSize: 13, color: '#4a5568' }}>
                    <p style={{ marginBottom: 12 }}>
                        Avaliação: <strong>#{avaliacaoAlvo?.id}</strong> · Fim atual: <strong>{fmt(avaliacaoAlvo?.data_fim)}</strong>
                    </p>
                    <Form.Group>
                        <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                            Nova data de encerramento
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={novaDataFim}
                            onChange={e => setNovaDataFim(e.target.value)}
                            disabled={loadingProrrogar}
                            size="sm"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', gap: 8, padding: '12px 20px' }}>
                    <Button variant="light" size="sm" onClick={() => setShowProrrogar(false)} disabled={loadingProrrogar}>
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        style={{ background: '#1D5E24', border: 'none', minWidth: 90 }}
                        onClick={handleProrrogarConfirm}
                        disabled={loadingProrrogar}
                    >
                        {loadingProrrogar
                            ? <><Spinner size="sm" animation="border" className="me-1" />Salvando...</>
                            : 'Confirmar'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Table_Avaliacao;