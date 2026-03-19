// src/components/Tables/Table_Avaliacao.js
import React, { useState, useEffect, useRef } from 'react';
import { Table, Modal, Form, Button, Spinner, Badge, Pagination } from 'react-bootstrap';
import { TfiMore } from 'react-icons/tfi';
import styled from 'styled-components';
import { FaTrash } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { BsUpload } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import {
    getAvaliacoes,
    enviarAvaliacao,
    deletarAvaliacaoById,
    prorrogarAvaliacaoById
} from '../../services/avaliacoesService';

// ── styled-components ────────────────────────────
const TableContainer = styled.div`margin: 20px;`;

const OptionsMenu = styled.div`
  position: absolute;
  width: 145px;
  background-color: white;
  border: 1px solid #ccc;
  padding: 5px;
  display: ${({ visible }) => (visible ? 'block' : 'none')};
  box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
  z-index: 1;
`;

const Option = styled.div`
  padding: 5px 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background-color: ${({ disabled }) => disabled ? 'transparent' : '#f5f5f5'};
  }
`;

// ── constantes ───────────────────────────────────
const STATUS_CONFIG = {
    1: { label: 'Rascunho',  bg: 'secondary' },
    2: { label: 'Enviada',   bg: 'primary'   },
    3: { label: 'Encerrada', bg: 'danger'    },
};

const ITENS_POR_PAGINA = 10;

// ────────────────────────────────────────────────
// Modal genérico de confirmação
// ────────────────────────────────────────────────
function ConfirmModal({ show, onConfirm, onCancel, title, body, confirmLabel = 'Confirmar', confirmVariant = 'primary', loading }) {
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
                <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    disabled={loading}
                    style={{ minWidth: 110 }}
                >
                    {loading
                        ? <><Spinner size="sm" animation="border" className="me-2" />Aguarde...</>
                        : confirmLabel
                    }
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

// ────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────
const Table_Avaliacao = ({ filtroStatus, searchQuery = '', refreshTable }) => {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [menuVisible, setMenuVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);

    // loading por ID
    const [loadingEnviarId, setLoadingEnviarId]     = useState(null);
    const [loadingExcluirId, setLoadingExcluirId]   = useState(null);
    const [loadingProrrogarId, setLoadingProrrogarId] = useState(null);

    // modal de confirmação de envio
    const [showEnviarModal, setShowEnviarModal] = useState(false);
    const [avaliacaoParaEnviar, setAvaliacaoParaEnviar] = useState(null);

    // modal de confirmação de exclusão
    const [showExcluirModal, setShowExcluirModal] = useState(false);
    const [avaliacaoParaExcluir, setAvaliacaoParaExcluir] = useState(null);

    // modal de prorrogação
    const [showProrrogar, setShowProrrogar] = useState(false);
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
    const [novaDataFim, setNovaDataFim] = useState('');

    const toast = useRef(null);
    const navigate = useNavigate();

    // ── busca ─────────────────────────────────────
    const fetchAvaliacoes = async () => {
        setLoading(true);
        try {
            const data = await getAvaliacoes();
            setAvaliacoes(data || []);
            setPaginaAtual(1);
        } catch (error) {
            showToast('error', 'Erro ao carregar avaliações.');
        } finally {
            setLoading(false);
        }
    };

    // Re-busca quando refreshTable muda (avaliação criada no modal)
    useEffect(() => {
        fetchAvaliacoes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTable]);

    // Volta p/ pág 1 ao mudar filtro ou busca
    useEffect(() => { setPaginaAtual(1); }, [filtroStatus, searchQuery]);

    useEffect(() => { window.scrollTo(0, 0); }, [paginaAtual]);

    // ── helpers ───────────────────────────────────
    const showToast = (severity, message) => {
        toast.current?.show({
            severity,
            summary: severity === 'error' ? 'Erro' : 'Sucesso',
            detail: message,
            life: 4000
        });
    };

    // ── filtros: status + busca ───────────────────
    const avaliacoesFiltradas = avaliacoes
        .filter(a => filtroStatus ? a.status === filtroStatus : true)
        .filter(a => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                String(a.id).includes(q) ||
                (a.periodo_letivo || '').toLowerCase().includes(q) ||
                (a.ano || '').toLowerCase().includes(q) ||
                (a.modalidades || []).some(m =>
                    (m.mod_ensino || '').toLowerCase().includes(q)
                )
            );
        });

    const totalPaginas = Math.ceil(avaliacoesFiltradas.length / ITENS_POR_PAGINA);
    const avaliacoesPaginadas = avaliacoesFiltradas.slice(
        (paginaAtual - 1) * ITENS_POR_PAGINA,
        paginaAtual * ITENS_POR_PAGINA
    );

    // ── handlers de menu ─────────────────────────
    const handleMoreClick = (id) => {
        setMenuVisible(menuVisible === id ? null : id);
    };

    const handleVisualizar = (avaliacao) => {
        setMenuVisible(null);
        navigate(`/relatorio/${avaliacao.id}`);
    };

    // ── ENVIAR: abre modal de confirmação ────────
    const handleEnviarRequest = (avaliacao) => {
        setMenuVisible(null);
        setAvaliacaoParaEnviar(avaliacao);
        setShowEnviarModal(true);
    };

    const handleEnviarConfirm = async () => {
        if (!avaliacaoParaEnviar) return;
        setLoadingEnviarId(avaliacaoParaEnviar.id);
        try {
            await enviarAvaliacao(avaliacaoParaEnviar.id);
            showToast('success', 'Avaliação enviada com sucesso.');
            setShowEnviarModal(false);
            setAvaliacaoParaEnviar(null);
            fetchAvaliacoes();
        } catch (err) {
            const mensagem = err.detalhes
                ? `${err.error} ${err.detalhes.join(' | ')}`
                : err.error || 'Erro ao enviar avaliação.';
            showToast('error', mensagem);
        } finally {
            setLoadingEnviarId(null);
        }
    };

    // ── EXCLUIR: abre modal de confirmação ───────
    const handleExcluirRequest = (avaliacao) => {
        setMenuVisible(null);
        setAvaliacaoParaExcluir(avaliacao);
        setShowExcluirModal(true);
    };

    const handleExcluirConfirm = async () => {
        if (!avaliacaoParaExcluir) return;
        setLoadingExcluirId(avaliacaoParaExcluir.id);
        try {
            await deletarAvaliacaoById(avaliacaoParaExcluir.id);
            showToast('success', 'Avaliação excluída com sucesso.');
            setShowExcluirModal(false);
            setAvaliacaoParaExcluir(null);
            fetchAvaliacoes();
        } catch (err) {
            showToast('error', err.error || 'Erro ao excluir avaliação.');
        } finally {
            setLoadingExcluirId(null);
        }
    };

    // ── PRORROGAR ─────────────────────────────────
    const handleAbrirProrrogar = (avaliacao) => {
        setMenuVisible(null);
        setAvaliacaoSelecionada(avaliacao);
        setNovaDataFim('');
        setShowProrrogar(true);
    };

    const handleConfirmarProrrogar = async () => {
        if (loadingProrrogarId === avaliacaoSelecionada?.id) return;
        if (!novaDataFim) {
            showToast('error', 'Informe a nova data de encerramento.');
            return;
        }
        setLoadingProrrogarId(avaliacaoSelecionada.id);
        try {
            await prorrogarAvaliacaoById(avaliacaoSelecionada.id, novaDataFim);
            showToast('success', 'Avaliação prorrogada com sucesso.');
            setShowProrrogar(false);
            fetchAvaliacoes();
        } catch (err) {
            showToast('error', err.error || 'Erro ao prorrogar avaliação.');
        } finally {
            setLoadingProrrogarId(null);
        }
    };

    const estaProrrogando = loadingProrrogarId === avaliacaoSelecionada?.id;

    // ── render ────────────────────────────────────
    return (
        <TableContainer>
            <Toast ref={toast} />

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-2 text-muted">Carregando avaliações...</p>
                </div>
            ) : (
                <>
                    <Table striped>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Modalidades</th>
                                <th>Período letivo</th>
                                <th>Ano</th>
                                <th>Início</th>
                                <th>Fim</th>
                                <th>Status</th>
                                <th>Opções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {avaliacoesPaginadas.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-4">
                                        {searchQuery
                                            ? `Nenhuma avaliação encontrada para "${searchQuery}".`
                                            : 'Nenhuma avaliação encontrada.'}
                                    </td>
                                </tr>
                            ) : (
                                avaliacoesPaginadas.map((item) => {
                                    const estaEnviando  = loadingEnviarId  === item.id;
                                    const estaExcluindo = loadingExcluirId === item.id;
                                    const estaCarregando = estaEnviando || estaExcluindo;

                                    return (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>
                                                {item.modalidades?.length > 0
                                                    ? item.modalidades.map((m, idx) => (
                                                        <span key={idx}>
                                                            {m.mod_ensino}
                                                            {idx < item.modalidades.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))
                                                    : 'N/A'}
                                            </td>
                                            <td>{item.periodo_letivo || 'N/A'}</td>
                                            <td>{item.ano || 'N/A'}</td>
                                            <td>{item.data_inicio ? new Date(item.data_inicio).toLocaleDateString() : 'N/A'}</td>
                                            <td>{item.data_fim   ? new Date(item.data_fim).toLocaleDateString()   : 'N/A'}</td>
                                            <td>
                                                <Badge bg={STATUS_CONFIG[item.status]?.bg || 'dark'}>
                                                    {STATUS_CONFIG[item.status]?.label || 'Desconhecido'}
                                                </Badge>
                                            </td>
                                            <td style={{ position: 'relative' }}>
                                                {estaCarregando ? (
                                                    <Spinner animation="border" size="sm" variant="secondary" />
                                                ) : (
                                                    <TfiMore
                                                        onClick={() => handleMoreClick(item.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                )}

                                                <OptionsMenu visible={menuVisible === item.id}>
                                                    <Option onClick={() => handleVisualizar(item)}>
                                                        Visualizar <IoEyeOutline className='ms-2' />
                                                    </Option>

                                                    {item.status === 1 && (
                                                        <Option
                                                            disabled={estaEnviando}
                                                            onClick={() => !estaEnviando && handleEnviarRequest(item)}
                                                        >
                                                            {estaEnviando
                                                                ? <><Spinner size="sm" animation="border" /> Enviando...</>
                                                                : <>Enviar <BsUpload className='ms-2' /></>
                                                            }
                                                        </Option>
                                                    )}

                                                    {item.status === 2 && (
                                                        <Option onClick={() => handleAbrirProrrogar(item)}>
                                                            Prorrogar <BsUpload className='ms-2' />
                                                        </Option>
                                                    )}

                                                    {item.status === 1 && (
                                                        <Option
                                                            disabled={estaExcluindo}
                                                            onClick={() => !estaExcluindo && handleExcluirRequest(item)}
                                                        >
                                                            {estaExcluindo
                                                                ? <><Spinner size="sm" animation="border" /> Excluindo...</>
                                                                : <>Excluir <FaTrash className='ms-2' /></>
                                                            }
                                                        </Option>
                                                    )}
                                                </OptionsMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>

                    {/* Paginação */}
                    {totalPaginas > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-muted">
                                Exibindo {((paginaAtual - 1) * ITENS_POR_PAGINA) + 1}–
                                {Math.min(paginaAtual * ITENS_POR_PAGINA, avaliacoesFiltradas.length)} de{' '}
                                {avaliacoesFiltradas.length} avaliações
                            </small>
                            <Pagination size="sm" className="mb-0">
                                <Pagination.Prev
                                    disabled={paginaAtual === 1}
                                    onClick={() => setPaginaAtual(p => p - 1)}
                                />
                                {Array.from({ length: totalPaginas }, (_, i) => (
                                    <Pagination.Item
                                        key={i + 1}
                                        active={paginaAtual === i + 1}
                                        onClick={() => setPaginaAtual(i + 1)}
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next
                                    disabled={paginaAtual === totalPaginas}
                                    onClick={() => setPaginaAtual(p => p + 1)}
                                />
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            {/* ── Modal: confirmar ENVIO ─────────────── */}
            <ConfirmModal
                show={showEnviarModal}
                onConfirm={handleEnviarConfirm}
                onCancel={() => { setShowEnviarModal(false); setAvaliacaoParaEnviar(null); }}
                title="Enviar Avaliação"
                body={
                    <p>
                        Deseja enviar a avaliação do período{' '}
                        <strong>{avaliacaoParaEnviar?.periodo_letivo}</strong>?
                        <br />
                        <span className="text-muted small">
                            Após enviada, a avaliação não poderá ser editada ou excluída.
                        </span>
                    </p>
                }
                confirmLabel="Enviar"
                confirmVariant="success"
                loading={loadingEnviarId === avaliacaoParaEnviar?.id}
            />

            {/* ── Modal: confirmar EXCLUSÃO ──────────── */}
            <ConfirmModal
                show={showExcluirModal}
                onConfirm={handleExcluirConfirm}
                onCancel={() => { setShowExcluirModal(false); setAvaliacaoParaExcluir(null); }}
                title="Excluir Avaliação"
                body={
                    <p>
                        Tem certeza que deseja excluir a avaliação do período{' '}
                        <strong>{avaliacaoParaExcluir?.periodo_letivo}</strong>?
                        <br />
                        <span className="text-muted small">Esta ação não pode ser desfeita.</span>
                    </p>
                }
                confirmLabel="Excluir"
                confirmVariant="danger"
                loading={loadingExcluirId === avaliacaoParaExcluir?.id}
            />

            {/* ── Modal: PRORROGAR ───────────────────── */}
            <Modal
                show={showProrrogar}
                onHide={() => !estaProrrogando && setShowProrrogar(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Prorrogar Avaliação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Avaliação: <strong>{avaliacaoSelecionada?.periodo_letivo}</strong></p>
                    <p>
                        Data atual de encerramento:{' '}
                        <strong>
                            {avaliacaoSelecionada?.data_fim
                                ? new Date(avaliacaoSelecionada.data_fim).toLocaleDateString()
                                : 'N/A'}
                        </strong>
                    </p>
                    <Form.Group>
                        <Form.Label>Nova data de encerramento</Form.Label>
                        <Form.Control
                            type="date"
                            value={novaDataFim}
                            onChange={e => setNovaDataFim(e.target.value)}
                            disabled={estaProrrogando}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowProrrogar(false)}
                        disabled={estaProrrogando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        style={{ backgroundColor: '#1D5E24', borderColor: '#1D5E24' }}
                        onClick={handleConfirmarProrrogar}
                        disabled={estaProrrogando}
                    >
                        {estaProrrogando
                            ? <><Spinner size="sm" animation="border" className="me-2" />Salvando...</>
                            : 'Confirmar Prorrogação'
                        }
                    </Button>
                </Modal.Footer>
            </Modal>
        </TableContainer>
    );
};

export default Table_Avaliacao;