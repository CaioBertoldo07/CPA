import api from './index';

export const getPadraoResposta = () => api.get('/padraoresposta');
export const getPadraoRespostaById = (id) => api.get(`/padraoresposta/${id}`);
export const cadastrarPadraoResposta = (padraoResposta) => api.post('/padraoresposta', padraoResposta);
export const editarPadraoResposta = (id, padraoResposta) => api.put(`/padraoresposta/${id}`, padraoResposta);
export const deletarPadraoResposta = (id) => api.delete(`/padraoresposta/${id}`);
