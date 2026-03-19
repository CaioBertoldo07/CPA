// src/pages/Relatorios.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Spinner, Table } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import NavigationBar from '../components/utils/NavBar';
import SearchBar from '../components/utils/SearchBar';
import { getAvaliacoes } from '../services/avaliacoesService';
import './Eixos.css';

const STATUS_CONFIG = {
    1: { label: 'Rascunho',  bg: 'secondary' },
    2: { label: 'Enviada',   bg: 'primary'   },
    3: { label: 'Encerrada', bg: 'danger'    },
};

const Relatorios = () => {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAvaliacoes = async () => {
            setLoading(true);
            try {
                const data = await getAvaliacoes();
                setAvaliacoes(data || []);
            } catch (err) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível carregar as avaliações.',
                    life: 4000,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchAvaliacoes();
    }, []);

    // ── métricas do dashboard ──────────────────────
    const total     = avaliacoes.length;
    const enviadas  = avaliacoes.filter(a => a.status === 2).length;
    const encerradas = avaliacoes.filter(a => a.status === 3).length;
    const rascunhos = avaliacoes.filter(a => a.status === 1).length;

    // ── filtro por busca ───────────────────────────
    const filtered = avaliacoes.filter(a => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        return (
            String(a.id).includes(q) ||
            (a.periodo_letivo || '').toLowerCase().includes(q) ||
            (a.ano || '').toLowerCase().includes(q) ||
            (a.modalidades || []).some(m =>
                (m.mod_ensino || '').toLowerCase().includes(q)
            )
        );
    });

    return (
        <div>
            <NavigationBar />
            <Toast ref={toast} />
            <div className="container">
                <div className="title">
                    <h1>Relatórios</h1>
                </div>

                {/* ── Cards de métricas ─────────────────── */}
                <Row className="mb-4 g-3">
                    {[
                        { label: 'Total',      value: total,      color: '#1D5E24', icon: '📋' },
                        { label: 'Enviadas',   value: enviadas,   color: '#0d6efd', icon: '📤' },
                        { label: 'Encerradas', value: encerradas, color: '#dc3545', icon: '🔒' },
                        { label: 'Rascunhos',  value: rascunhos,  color: '#6c757d', icon: '📝' },
                    ].map(card => (
                        <Col xs={6} md={3} key={card.label}>
                            <Card className="h-100 text-center shadow-sm border-0">
                                <Card.Body>
                                    <div style={{ fontSize: '1.8rem' }}>{card.icon}</div>
                                    <h2 style={{ color: card.color, fontWeight: 700, margin: '4px 0' }}>
                                        {loading ? '—' : card.value}
                                    </h2>
                                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                        {card.label}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* ── Tabela de avaliações ──────────────── */}
                <div className="eixos_table">
                    <Row className="mb-2">
                        <Col xs={12}>
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="    Pesquisar avaliações..."
                            />
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="success" />
                            <p className="mt-2 text-muted">Carregando avaliações...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-muted text-center py-4">
                            {searchQuery
                                ? `Nenhuma avaliação encontrada para "${searchQuery}".`
                                : 'Nenhuma avaliação encontrada.'}
                        </p>
                    ) : (
                        <Table striped hover>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Modalidades</th>
                                    <th>Período</th>
                                    <th>Ano</th>
                                    <th>Início</th>
                                    <th>Fim</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(av => (
                                    <tr key={av.id}>
                                        <td>{av.id}</td>
                                        <td>
                                            {(av.modalidades || []).map((m, i) => (
                                                <span key={i}>
                                                    {m.mod_ensino}
                                                    {i < av.modalidades.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </td>
                                        <td>{av.periodo_letivo || '—'}</td>
                                        <td>{av.ano || '—'}</td>
                                        <td>{av.data_inicio ? new Date(av.data_inicio).toLocaleDateString() : '—'}</td>
                                        <td>{av.data_fim   ? new Date(av.data_fim).toLocaleDateString()   : '—'}</td>
                                        <td>
                                            <Badge bg={STATUS_CONFIG[av.status]?.bg || 'dark'}>
                                                {STATUS_CONFIG[av.status]?.label || 'Desconhecido'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm"
                                                style={{
                                                    backgroundColor: '#1D5E24',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    padding: '4px 12px',
                                                }}
                                                onClick={() => navigate(`/relatorio/${av.id}`)}
                                            >
                                                Ver Relatório
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Relatorios;