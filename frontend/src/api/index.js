import axios from 'axios';
import { getToken, clearAll } from './tokenStore';

const configuredBackendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.REACT_APP_BACKEND_URL ||
    '';
const normalizedBackendUrl = configuredBackendUrl
    ? configuredBackendUrl.replace(/\/+$/, '')
    : '';

const fallbackBaseUrl = import.meta.env.DEV
    ? 'http://localhost:3034/api'
    : '/api';

const api = axios.create({
    baseURL: normalizedBackendUrl ? `${normalizedBackendUrl}/api` : fallbackBaseUrl,
});

// Interceptor de requisição para adicionar o token no cabeçalho
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de resposta para lidar com erros de autenticação
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Notifica a aplicação sobre o erro de autenticação via evento customizado
            // Isso permite que um componente React (como App.jsx) lide com o redirect e o Toast
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));

            clearAll(); // Limpa o token e dados do usuário por segurança
        }
        return Promise.reject(error); // Rejeita o erro para handlers adicionais
    }
);

export default api;
