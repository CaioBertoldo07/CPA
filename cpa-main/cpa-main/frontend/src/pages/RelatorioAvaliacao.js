import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRespostasPorAvaliacao } from '../services/respostasService';
import { getAvaliacaoById } from '../services/avaliacoesService'; // Serviço para obter dados da avaliação
import Chart from 'react-apexcharts';
import NavigationBar from '../components/utils/NavBar';

const RelatorioAvaliacao = ({ token }) => {
    const { id } = useParams();
    const [relatorio, setRelatorio] = useState(null);
    const [avaliacao, setAvaliacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscando os dados do relatório (incluindo respostas padrão e adicionais)
                const relatorioData = await getRespostasPorAvaliacao(id, token);
                if (!relatorioData) throw new Error('Dados do relatório não encontrados.');
                setRelatorio(relatorioData);

                // Buscando os dados da avaliação
                const avaliacaoData = await getAvaliacaoById(id, token);
                if (!avaliacaoData) throw new Error('Dados da avaliação não encontrados.');
                setAvaliacao(avaliacaoData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, token]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div>Erro: {error}</div>;
    if (!relatorio || !relatorio.relatorio || !avaliacao) return <div>Dados não disponíveis.</div>;

    const renderCharts = () => {
        return Object.entries(relatorio.relatorio).map(([dimensao, dados], index) => {
            const questoes = dados.questoes || [];

            // Cria um array unificado que, para cada questão,
            // define a categoria a ser exibida:
            // - Se for questão normal (tipo !== 2): usa apenas a descrição.
            // - Se for questão do tipo 2 (grade): para cada grupo adicional, concatena "descrição - grupo".
            const combinedData = [];
            questoes.forEach(q => {
                if (q.tipo === 2 && q.adicionais && Object.keys(q.adicionais).length > 0) {
                    Object.entries(q.adicionais).forEach(([groupName, groupData]) => {
                        combinedData.push({
                            label: `${q.descricao} - ${groupName}`,
                            responses: groupData.respostas
                        });
                    });
                } else {
                    combinedData.push({
                        label: q.descricao,
                        responses: q.respostas
                    });
                }
            });

            // Extrai todas as alternativas únicas presentes nas respostas
            const alternativas = Array.from(
                new Set(combinedData.flatMap(item => Object.keys(item.responses)))
            );

            // Cria a série de dados para cada alternativa,
            // utilizando a porcentagem já calculada
            const series = alternativas.map(alt => ({
                name: alt,
                data: combinedData.map(item =>
                    item.responses[alt] ? parseFloat(item.responses[alt].porcentagem) : 0
                )
            }));

            const options = {
                chart: {
                    type: 'bar',
                    height: 400,
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                    },
                },
                xaxis: {
                    categories: combinedData.map(item => item.label),
                },
                yaxis: {
                    title: {
                        text: 'Porcentagem (%)',
                    },
                },
                title: {
                    text: `Dimensão: ${dimensao}`,
                    align: 'center',
                },
                tooltip: {
                    y: {
                        formatter: (val) => `${val}%`,
                    },
                },
                fill: {
                    opacity: 0.7,
                },
                legend: {
                    position: 'bottom',
                },
            };

            return (
                <div
                    key={index}
                    style={{
                        marginBottom: '50px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        maxWidth: '1400px',
                        margin: '0 auto',
                    }}
                >
                    <Chart options={options} series={series} type="bar" height={400} />
                </div>
            );
        });
    };

    return (
        <div>
            <NavigationBar />
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Relatório de Avaliação - ID: {id}</h2>

            {/* Informações da Avaliação e Número de Respondentes */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                {/* Caixa de Informações da Avaliação */}
                <div style={{
                    flex: 1,
                    maxWidth: '700px',
                    marginRight: '10px',
                    padding: '20px',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                }}>
                    <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Informações da Avaliação</h3>
                    <p><strong>Ano:</strong> {avaliacao.ano}</p>
                    <p><strong>Período Letivo:</strong> {avaliacao.periodo_letivo}</p>
                    <p><strong>Data de Início:</strong> {new Date(avaliacao.data_inicio).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Data de Fim:</strong> {new Date(avaliacao.data_fim).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Status:</strong> {avaliacao.status === 1 ? 'Ativo' : 'Inativo'}</p>
                </div>

                {/* Caixa de Número de Respondentes */}
                <div style={{
                    flex: 1,
                    maxWidth: '700px',
                    marginLeft: '10px',
                    padding: '20px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ marginBottom: '15px' }}>Número de Respondentes</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4A90E2' }}>{relatorio.totalAvaliadores}</p>
                </div>
            </div>

            {/* Gráficos das Dimensões */}
            <div>
                <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#4A90E2', fontWeight: 'bold' }}>Dimensões Avaliadas</h3>
                {renderCharts()}
            </div>
        </div>
    );
};

export default RelatorioAvaliacao;
