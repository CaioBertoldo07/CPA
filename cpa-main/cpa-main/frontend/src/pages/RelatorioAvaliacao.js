// src/pages/RelatorioAvaliacao.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Row, Col, Card, Badge, Spinner,
    Table, Alert, ProgressBar
} from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import NavigationBar from '../components/utils/NavBar';
import { getAvaliacaoById } from '../services/avaliacoesService';
import { getRespostasPorAvaliacao } from '../services/respostasService';
import './Eixos.css';

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
const STATUS_CONFIG = {
    1: { label: 'Rascunho',  bg: 'secondary' },
    2: { label: 'Enviada',   bg: 'primary'   },
    3: { label: 'Encerrada', bg: 'danger'    },
};

const fmt = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '—';

// Agrupa respostas por questão e calcula distribuição de alternativas
const agruparRespostas = (respostas = []) => {
    const mapa = {};
    for (const r of respostas) {
        const id = r.id_questao ?? r.questao?.id;
        if (!mapa[id]) {
            mapa[id] = {
                descricao: r.questao?.descricao ?? `Questão ${id}`,
                dimensao: r.questao?.dimensao?.nome ?? '—',
                eixo: r.questao?.dimensao?.eixo?.nome ?? '—',
                total: 0,
                alternativas: {},
            };
        }
        mapa[id].total += 1;
        const alt = r.alternativa?.descricao ?? r.resposta ?? 'Sem resposta';
        mapa[id].alternativas[alt] = (mapa[id].alternativas[alt] || 0) + 1;
    }
    return Object.values(mapa);
};

// Cores fixas para as barras de progresso
const CORES_BARRA = [
    '#1D5E24', '#0d6efd', '#fd7e14', '#6f42c1', '#dc3545', '#20c997',
];

// ────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────
const RelatorioAvaliacao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useRef(null);

    const [avaliacao, setAvaliacao] = useState(null);
    const [respostas, setRespostas] = useState([]);
    const [loadingAvaliacao, setLoadingAvaliacao] = useState(true);
    const [loadingRespostas, setLoadingRespostas] = useState(true);
    const [errorAvaliacao, setErrorAvaliacao] = useState('');
    const [errorRespostas, setErrorRespostas] = useState('');

    // ── busca dados ────────────────────────────────
    useEffect(() => {
        if (!id) {
            setErrorAvaliacao('ID da avaliação não informado.');
            setLoadingAvaliacao(false);
            return;
        }

        const fetchAvaliacao = async () => {
            setLoadingAvaliacao(true);
            setErrorAvaliacao('');
            try {
                const data = await getAvaliacaoById(id);
                if (!data) throw new Error('Avaliação não encontrada.');
                setAvaliacao(data);
            } catch (err) {
                const msg = err?.response?.status === 404
                    ? `Avaliação #${id} não encontrada.`
                    : err?.response?.data?.error || 'Erro ao carregar dados da avaliação.';
                setErrorAvaliacao(msg);
            } finally {
                setLoadingAvaliacao(false);
            }
        };

        const fetchRespostas = async () => {
            setLoadingRespostas(true);
            setErrorRespostas('');
            try {
                const data = await getRespostasPorAvaliacao(id);
                setRespostas(Array.isArray(data) ? data : []);
            } catch (err) {
                const status = err?.response?.status;
                if (status === 404) {
                    // Sem respostas ainda — não é erro crítico
                    setRespostas([]);
                } else {
                    setErrorRespostas(
                        err?.response?.data?.error || 'Erro ao carregar respostas.'
                    );
                }
            } finally {
                setLoadingRespostas(false);
            }
        };

        fetchAvaliacao();
        fetchRespostas();
    }, [id]);

    // ── métricas das respostas ─────────────────────
    const totalRespostas   = respostas.length;
    const questoesAgrupadas = agruparRespostas(respostas);
    const totalQuestoes    = questoesAgrupadas.length;

    // ── estado de carregamento inicial ─────────────
    if (loadingAvaliacao) {
        return (
            <div>
                <NavigationBar />
                <div className="container text-center py-5">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-3 text-muted">Carregando avaliação...</p>
                </div>
            </div>
        );
    }

    // ── erro ao carregar avaliação ─────────────────
    if (errorAvaliacao) {
        return (
            <div>
                <NavigationBar />
                <div className="container py-5">
                    <Alert variant="danger">
                        <Alert.Heading>Não foi possível carregar o relatório</Alert.Heading>
                        <p>{errorAvaliacao}</p>
                        <hr />
                        <div className="d-flex justify-content-end">
                            <button
                                className="btn btn-outline-danger"
                                onClick={() => navigate('/relatorios')}
                            >
                                ← Voltar para Relatórios
                            </button>
                        </div>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div>
            <NavigationBar />
            <Toast ref={toast} />
            <div className="container">

                {/* ── Breadcrumb / voltar ─────────────── */}
                <div className="d-flex align-items-center gap-2 mt-3 mb-1">
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate('/relatorios')}
                    >
                        ← Voltar
                    </button>
                    <span className="text-muted small">Relatórios / Avaliação #{avaliacao?.id}</span>
                </div>

                <div className="title">
                    <h1>
                        Relatório da Avaliação #{avaliacao?.id}
                        <Badge
                            bg={STATUS_CONFIG[avaliacao?.status]?.bg || 'dark'}
                            className="ms-3"
                            style={{ fontSize: '0.7rem', verticalAlign: 'middle' }}
                        >
                            {STATUS_CONFIG[avaliacao?.status]?.label || 'Desconhecido'}
                        </Badge>
                    </h1>
                </div>

                {/* ── Dados da avaliação ──────────────── */}
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Header style={{ backgroundColor: '#1D5E24', color: '#fff', fontWeight: 600 }}>
                        Informações da Avaliação
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={3} sm={6} className="mb-2">
                                <small className="text-muted d-block">Período</small>
                                <strong>{avaliacao?.periodo_letivo || '—'}</strong>
                            </Col>
                            <Col md={3} sm={6} className="mb-2">
                                <small className="text-muted d-block">Ano</small>
                                <strong>{avaliacao?.ano || '—'}</strong>
                            </Col>
                            <Col md={3} sm={6} className="mb-2">
                                <small className="text-muted d-block">Início</small>
                                <strong>{fmt(avaliacao?.data_inicio)}</strong>
                            </Col>
                            <Col md={3} sm={6} className="mb-2">
                                <small className="text-muted d-block">Fim</small>
                                <strong>{fmt(avaliacao?.data_fim)}</strong>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col md={6} sm={12} className="mb-2">
                                <small className="text-muted d-block">Modalidades</small>
                                <div className="d-flex flex-wrap gap-1 mt-1">
                                    {(avaliacao?.modalidades || []).length > 0
                                        ? avaliacao.modalidades.map((m, i) => (
                                            <Badge key={i} bg="success" style={{ fontWeight: 400 }}>
                                                {m.mod_ensino}
                                            </Badge>
                                        ))
                                        : <span className="text-muted small">—</span>
                                    }
                                </div>
                            </Col>
                            <Col md={6} sm={12}>
                                <small className="text-muted d-block">Unidades</small>
                                <div className="d-flex flex-wrap gap-1 mt-1">
                                    {(avaliacao?.unidades || []).length > 0
                                        ? avaliacao.unidades.map((u, i) => (
                                            <Badge key={i} bg="secondary" style={{ fontWeight: 400 }}>
                                                {u.sigla || u.nome}
                                            </Badge>
                                        ))
                                        : <span className="text-muted small">—</span>
                                    }
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* ── Cards de métricas de respostas ─── */}
                <Row className="mb-4 g-3">
                    {[
                        { label: 'Total de Respostas', value: totalRespostas,  icon: '📊', color: '#1D5E24' },
                        { label: 'Questões Respondidas', value: totalQuestoes, icon: '✅', color: '#0d6efd' },
                    ].map(card => (
                        <Col xs={6} md={3} key={card.label}>
                            <Card className="h-100 text-center shadow-sm border-0">
                                <Card.Body>
                                    <div style={{ fontSize: '1.8rem' }}>{card.icon}</div>
                                    <h2 style={{ color: card.color, fontWeight: 700, margin: '4px 0' }}>
                                        {loadingRespostas ? '—' : card.value}
                                    </h2>
                                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                        {card.label}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* ── Respostas por questão ───────────── */}
                <div className="eixos_table">
                    <h5 style={{ color: '#1D5E24', marginBottom: 16 }}>
                        Respostas por Questão
                    </h5>

                    {loadingRespostas ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="success" />
                            <p className="mt-2 text-muted">Carregando respostas...</p>
                        </div>
                    ) : errorRespostas ? (
                        <Alert variant="warning">
                            <strong>Atenção:</strong> {errorRespostas}
                        </Alert>
                    ) : questoesAgrupadas.length === 0 ? (
                        <Alert variant="info">
                            Esta avaliação ainda não possui respostas registradas.
                        </Alert>
                    ) : (
                        questoesAgrupadas.map((q, idx) => (
                            <Card key={idx} className="mb-3 shadow-sm border-0">
                                <Card.Header
                                    style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #1D5E24' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-1">
                                        <span style={{ fontWeight: 600 }}>{q.descricao}</span>
                                        <div className="d-flex gap-1 flex-wrap">
                                            {q.eixo !== '—' && (
                                                <Badge bg="success" style={{ fontWeight: 400 }}>
                                                    {q.eixo}
                                                </Badge>
                                            )}
                                            {q.dimensao !== '—' && (
                                                <Badge bg="secondary" style={{ fontWeight: 400 }}>
                                                    {q.dimensao}
                                                </Badge>
                                            )}
                                            <Badge bg="dark" style={{ fontWeight: 400 }}>
                                                {q.total} resp.
                                            </Badge>
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Table size="sm" className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>Alternativa</th>
                                                <th style={{ width: 80 }}>Qtd.</th>
                                                <th style={{ width: 80 }}>%</th>
                                                <th>Distribuição</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(q.alternativas).map(([alt, count], i) => {
                                                const pct = q.total > 0
                                                    ? Math.round((count / q.total) * 100)
                                                    : 0;
                                                return (
                                                    <tr key={i}>
                                                        <td>{alt}</td>
                                                        <td>{count}</td>
                                                        <td>{pct}%</td>
                                                        <td style={{ verticalAlign: 'middle' }}>
                                                            <ProgressBar
                                                                now={pct}
                                                                style={{
                                                                    height: 10,
                                                                    backgroundColor: '#e9ecef',
                                                                }}
                                                                variant={undefined}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: `${pct}%`,
                                                                        backgroundColor: CORES_BARRA[i % CORES_BARRA.length],
                                                                        height: '100%',
                                                                        borderRadius: 4,
                                                                        transition: 'width 0.4s ease',
                                                                    }}
                                                                />
                                                            </ProgressBar>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default RelatorioAvaliacao;