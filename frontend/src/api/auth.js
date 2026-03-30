import api from './index';
import { clearAll } from './tokenStore';

export const login = (email, senha) => api.post('/auth/login', { email, senha });
export const logoutRequest = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

export const logout = () => {
    return logoutRequest()
        .catch(() => null)
        .finally(() => {
            clearAll();
            window.location.href = '/login';
        });
};
