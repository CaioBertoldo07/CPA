import api from './index';

export const getEixos = () => api.get('/eixos');
export const getEixoByNumero = (id) => api.get(`/eixos/${id}`);
export const cadastrarEixo = (eixo) => api.post('/eixos', eixo);
export const editarEixo = (numero, data) => api.put(`/eixos/${numero}`, data);
export const deletarEixo = (id) => api.delete(`/eixos/${id}`);
