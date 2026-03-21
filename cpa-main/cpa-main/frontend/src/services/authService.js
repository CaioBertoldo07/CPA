// frontend/src/services/authService.js
import api from './apiConfig';

export const login = async (email, senha) => {
  try {
    console.log('Tentando logar com:', email);

    // const response = await api.post('/auth/login-dev', { // trocar para '/auth/login' em produção
    //   email,
    //   senha
    // });
    const response = await api.post('/auth/login', { // trocar para '/auth/login' em produção
      email,
      senha
    });

    console.log('Resposta do backend:', response);

    if (!response.data.token) {
      throw new Error('Token não encontrado');
    }

    // Armazenar o token, email e se o usuário é admin no localStorage
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('isAdmin', response.data.isAdmin);
    localStorage.setItem('userEmail', email);

    return {
      token: response.data.token,
      isAdmin: response.data.isAdmin
    };

  } catch (error) {
    console.error('Erro no login:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'Erro durante o login');
  }
};
