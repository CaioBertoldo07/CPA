import api from './index';

export const getDimensoes = () => api.get('/dimensoes');
export const getDimensaoByNumero = (numero) => api.get(`/dimensoes/numero/${numero}`);
export const getDimensoesByEixo = (eixoNumero) => api.get(`/dimensoes/eixo/${eixoNumero}`);
export const cadastrarDimensao = (dimensao) => api.post('/dimensoes', dimensao);
export const editarDimensao = (id, dimensao) => api.put(`/dimensoes/${id}`, dimensao);
export const updateDimensaoByNumero = (numero, data) => api.put(`/dimensoes/${numero}`, data);
export const deletarDimensao = (id) => api.delete(`/dimensoes/${id}`);
