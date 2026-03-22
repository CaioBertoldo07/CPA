import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCalendarAlt, faArrowRight, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/imgs/cpa_logo.svg';
import './Alunos.css';

import { useGetAvaliacoesDisponiveisQuery } from '../hooks/queries/useAvaliacaoQueries';

const Alunos = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');
    const { data: avaliacoes = [], isLoading } = useGetAvaliacoesDisponiveisQuery();
    const [usuarioNome, setUsuarioNome] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const decoded = jwtDecode(token);
            setUsuarioNome(decoded.usuarioNome || 'Usuário');
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            navigate('/login');
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <div className="alunos-container">
            <header className="main-header">
                <img src={logo} alt="CPA Logo" className="logo" />
                <div className="header-right">
                    <div className="user-info">
                        <h2>Olá, {usuarioNome}</h2>
                        <button className="logout-btn" onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="content-main">
                <div className="avaliacoes-header">
                    <h1>Avaliações Disponíveis</h1>
                    <div className="notification-badge">
                        <FontAwesomeIcon icon={faBell} />
                        {avaliacoes.length > 0 && <span>{avaliacoes.length}</span>}
                    </div>
                </div>
                <div className="avaliacoes-grid">
                    {isLoading ? (
                        <div className="loading-state">Carregando avaliações...</div>
                    ) : avaliacoes.length > 0 ? (
                        avaliacoes.map((avaliacao) => (
                            <div className="avaliacao-card" key={avaliacao.id}>
                                <div className="card-top">
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                    <span className="periodo">{avaliacao.periodo_letivo}</span>
                                </div>
                                <h3>{avaliacao.titulo}</h3>
                                <Link
                                    to={`/alunos/avaliacao/${avaliacao.id}`}
                                    className="responder-btn"
                                >
                                    Responder Avaliação
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>Nenhuma avaliação disponível no momento</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="main-footer">
                <div className="footer-content">
                    <p>© 2024 CPA - Todos os direitos reservados</p>
                    <div className="footer-links">
                        <a href="/sobre">Sobre</a>
                        <a href="/ajuda">Ajuda</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Alunos;