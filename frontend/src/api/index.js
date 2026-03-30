import axios from 'axios';
import { clearAll } from './tokenStore';

const configuredBackendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.REACT_APP_BACKEND_URL ||
    '';

const normalizeBackendBaseUrl = (rawUrl) => {
    if (!rawUrl) return '';
    const noTrailingSlash = rawUrl.replace(/\/+$/, '');
    return noTrailingSlash.replace(/\/api$/i, '');
};

const normalizedBackendUrl = normalizeBackendBaseUrl(configuredBackendUrl);

const resolveBaseURL = () => {
    if (!normalizedBackendUrl) {
        return '/api';
    }

    // Para sessão com cookie, prioriza mesma origem quando houver proxy /api.
    if (typeof window !== 'undefined') {
        try {
            const backendOrigin = new URL(normalizedBackendUrl).origin;
            if (backendOrigin !== window.location.origin) {
                return '/api';
            }
        } catch {
            return '/api';
        }
    }

    return `${normalizedBackendUrl}/api`;
};

const baseURL = resolveBaseURL();

const api = axios.create({
    baseURL,
    withCredentials: true,
});

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
