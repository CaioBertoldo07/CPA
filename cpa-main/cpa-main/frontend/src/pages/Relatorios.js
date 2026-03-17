import React, { useEffect, useState } from 'react';
import NavigationBar from '../components/utils/NavBar';
import { getAvaliacoes } from '../services/avaliacoesService';
import './Eixos.css';
import '../components/Tables/Table.css';

const Relatorios = () => {
    const [avaliacoes, setAvaliacoes] = useState([]); // Inicializa como array vazio
    const [loading, setLoading] = useState(true); // Indica o estado de carregamento

    useEffect(() => {
        const fetchAvaliacoes = async () => {
            try {
                const data = await getAvaliacoes(); // Recupera os dados
                setAvaliacoes(data || []); // Garante que seja um array mesmo se os dados forem undefined
            } catch (error) {
                console.error('Erro ao buscar as avaliações:', error);
            } finally {
                setLoading(false); // Para o estado de carregamento
            }
        };
        fetchAvaliacoes();
    }, []);

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <div>
            <NavigationBar />
            <div className='container'>
                <div className="title">
                    <h1>Relatórios</h1>
                </div>
                {avaliacoes.length > 0 ? (
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Curso</th>
                                <th>Unidade</th>
                                <th>Período</th>
                                <th>Modalidades</th>
                            </tr>
                        </thead>
                        <tbody>
                            {avaliacoes.map((avaliacao) => (
                                <tr key={avaliacao.id}>
                                    <td>{avaliacao.id}</td>
                                    <td>{avaliacao.curso?.nome || 'Curso não disponível'}</td> {/* Verifica se curso existe */}
                                    <td>{avaliacao.unidade?.sigla || 'Unidade não disponível'}</td> {/* Verifica se unidade existe */}
                                    <td>{avaliacao.periodo_letivo}</td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nenhuma avaliação encontrada.</p>
                )}
            </div>
        </div>
    );
};

export default Relatorios;
