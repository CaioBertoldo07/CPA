import api from './index';
import { clearAll, getToken, setToken } from './tokenStore';

export const login = (email, senha) => api.post('/auth/login', { email, senha });

export const logout = () => {
    clearAll();
    window.location.href = '/login';
};

export const getCurrentToken = () => getToken();
export const updateToken = (token) => setToken(token);
