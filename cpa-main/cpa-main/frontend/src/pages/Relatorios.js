// dashboard com métricas + tabela melhorada com link para relatório
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Badge, Card, Row, Col } from 'react-bootstrap'; // ADICIONADO: componentes visuais
import NavigationBar from '../components/utils/NavBar';
import { getAvaliacoes } from '../services/avaliacoesService';
import './Eixos.css';
import '../components/Tables/Table.css';

// ADICIONADO: mesma config de status da tabela de avaliações
const STATUS_CONFIG = {
    1: { label: 'Rascunho',  bg: 'secondary' },
    2: { label: 'Enviada',   bg: 'primary'   },
    3: { label: 'Encerrada', bg: 'danger'    },
};

const Relatorios = () => {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // ADICIONADO: para navegar ao relatório

    useEffect(() => {
        const fetchAvaliacoes = async () => {
            try {
                const data = await getAvaliacoes();
                setAvaliacoes(data || []);
            } catch (error) {
                console.error('Erro ao buscar as avaliações:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAvaliacoes();
    }, []);

    // ADICIONADO: métricas calculadas a partir das avaliações carregadas
    const totalAvaliacoes = avaliacoes.length;
    const totalEnviadas = avaliacoes.filter(a => a.status === 2).length;
    const totalEncerradas = avaliacoes.filter(a => a.status === 3).length;
    const totalRascunhos = avaliacoes.filter(a => a.status === 1).length;

    if (loading) {
        // ADICIONADO: spinner de carregamento
        return (
            <div>
                <NavigationBar />
                <div className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-2 text-muted">Carregando relatórios...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <NavigationBar />
            <div className='container'>
                <div className="title">
                    <h1>Relatórios</h1>
                </div>

                {/* ADICIONADO: cards de métricas do dashboard */}
                <Row className="mb-4 g-3">
                    <Col xs={12} sm={6} md={3}>
                        <Card className="text-center h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1D5E24' }}>
                                    {totalAvaliacoes}
                                </Card.Title>
                                <Card.Text className="text-muted">Total de Avaliações</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Card className="text-center h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6c757d' }}>
                                    {totalRascunhos}
                                </Card.Title>
                                <Card.Text className="text-muted">Em Rascunho</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Card className="text-center h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0d6efd' }}>
                                    {totalEnviadas}
                                </Card.Title>
                                <Card.Text className="text-muted">Enviadas</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Card className="text-center h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
                                    {totalEncerradas}
                                </Card.Title>
                                <Card.Text className="text-muted">Encerradas</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* MELHORADO: tabela com badge de status e link para relatório */}
                {avaliacoes.length === 0 ? (
                    <p className="text-center text-muted">Nenhuma avaliação encontrada.</p>
                ) : (
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Período</th>
                                <th>Ano</th>
                                <th>Status</th>
                                <th>Ação</th> {/* ADICIONADO: coluna de ação */}
                            </tr>
                        </thead>
                        <tbody>
                            {avaliacoes.map((avaliacao) => (
                                <tr key={avaliacao.id}>
                                    <td>{avaliacao.id}</td>
                                    <td>{avaliacao.periodo_letivo}</td>
                                    <td>{avaliacao.ano}</td>

                                    {/* ADICIONADO: badge de status */}
                                    <td>
                                        <Badge bg={STATUS_CONFIG[avaliacao.status]?.bg || 'dark'}>
                                            {STATUS_CONFIG[avaliacao.status]?.label || 'Desconhecido'}
                                        </Badge>
                                    </td>

                                    {/* ADICIONADO: botão para acessar relatório */}
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-success"
                                            onClick={() => navigate(`/relatorio/${avaliacao.id}`)}
                                        >
                                            Ver Relatório
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Relatorios;