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
import Alunos from './pages/Alunos';
import ProtectedRoute from './components/utils/ProtectedRoute';
import Categorias from "./pages/Categorias";
import AvaliacaoAlunos from './pages/AvaliacaoAlunos';
import PadraoResposta from './pages/Padrao_Resposta';
import RelatorioAvaliacao from './pages/RelatorioAvaliacao';
import Layout from './components/utils/Layout';

const App = () => {
    return (
        <Router>
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

                {/* Student Routes */}
                <Route path="/alunos" element={<ProtectedRoute element={Alunos} />} />
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
    );
};

export default App;
