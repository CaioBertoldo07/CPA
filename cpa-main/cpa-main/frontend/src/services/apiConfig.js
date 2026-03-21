// src/services/apiConfig.js
import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3034'}/api`,
});









// Interceptor de requisição para adicionar o token no cabeçalho
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de resposta para lidar com erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Expira a sessão quando o backend retorna 401 (token expirado ou inválido)
            alert('Sua sessão expirou. Faça login novamente.');
            localStorage.clear(); // Limpa o token e dados do usuário
            window.location.href = '/login'; // Redireciona para a página de login
        }
        return Promise.reject(error); // Rejeita o erro para handlers adicionais
    }
);

export default api;
