import api from './index';

export const login = (email, senha) => api.post('/auth/login', { email, senha });
