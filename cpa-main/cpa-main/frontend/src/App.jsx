// src/App.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Eixos from './pages/Eixos';
import Avaliacoes from './pages/Avaliacoes';
import AdminPage from './pages/AdminPage';
import Relatorios from './pages/Relatorios';
import Questoes from './pages/Questoes';
import Modalidades from './pages/Modalidades';
import { Navigate } from 'react-router-dom';
import AlunoAvaliacoes from './pages/aluno/AlunoAvaliacoes';
import AlunoHistorico from './pages/aluno/AlunoHistorico';
import AlunoAjuda from './pages/aluno/AlunoAjuda';
import ProtectedRoute from './components/utils/ProtectedRoute';
import Categorias from "./pages/Categorias";
import AvaliacaoAlunos from './pages/AvaliacaoAlunos';
import PadraoResposta from './pages/Padrao_Resposta';
import RelatorioAvaliacao from './pages/RelatorioAvaliacao';
import Agenda from './pages/Agenda';
import Cursos from './pages/Cursos';
import Layout from './components/utils/Layout';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';

import { NotificationProvider, useNotification } from './context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const AuthObserver = () => {
    const navigate = useNavigate();
    const showNotification = useNotification();

    React.useEffect(() => {
        const handleUnauthorized = () => {
            showNotification('Sua sessão expirou. Por favor, faça login novamente.', 'error');
            setTimeout(() => { navigate('/login'); }, 1500);
        };

        const handleAccessDenied = () => {
            showNotification('Você não tem permissão para acessar esta página.', 'warning');
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        window.addEventListener('auth:access-denied', handleAccessDenied);

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
            window.removeEventListener('auth:access-denied', handleAccessDenied);
        };
    }, [navigate, showNotification]);

    return null;
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NotificationProvider>
                <Router>
                    <AuthObserver />
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/" element={<LoginPage />} />

                        {/* Admin Routes with Layout */}
                        <Route path="/eixos" element={<ProtectedRoute element={Eixos} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/avaliacoes" element={<ProtectedRoute element={Avaliacoes} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/relatorios" element={<ProtectedRoute element={Relatorios} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/questoes" element={<ProtectedRoute element={Questoes} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/admin" element={<ProtectedRoute element={AdminPage} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/modalidades" element={<ProtectedRoute element={Modalidades} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/categorias" element={<ProtectedRoute element={Categorias} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/padraoresposta" element={<ProtectedRoute element={PadraoResposta} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/agenda" element={<ProtectedRoute element={Agenda} isAdminRequired={true} layout={Layout} />} />
                        <Route path="/cursos" element={<ProtectedRoute element={Cursos} isAdminRequired={true} layout={Layout} />} />

                        {/* Student Routes */}
                        <Route path="/alunos" element={<Navigate to="/alunos/avaliacoes" replace />} />
                        <Route path="/alunos/avaliacoes" element={<ProtectedRoute element={AlunoAvaliacoes} />} />
                        <Route path="/alunos/historico" element={<ProtectedRoute element={AlunoHistorico} />} />
                        <Route path="/alunos/ajuda" element={<ProtectedRoute element={AlunoAjuda} />} />
                        <Route
                            path="/alunos/avaliacao/:id"
                            element={<ProtectedRoute element={AvaliacaoAlunos} />}
                        />

                        {/* Relatório can also have Layout if it's for admins */}
                        <Route
                            path="/relatorio/:id"
                            element={<ProtectedRoute element={RelatorioAvaliacao} isAdminRequired={true} layout={Layout} />}
                        />
                    </Routes>
                </Router>
            </NotificationProvider>
        </ThemeProvider>
    );
};

export default App;
