import api from './index';

export const getAvaliacoes = (page = 0, pageSize = 10) =>
    api.get('/avaliacoes', { params: { page, pageSize } });
export const getAvaliacoesDisponiveis = () => api.get('/avaliacoes/disponiveis');
export const createAvaliacao = (avaliacaoData) => api.post('/avaliacoes', avaliacaoData);
export const editarAvaliacao = (id, avaliacaoData) => api.put(`/avaliacoes/${id}`, avaliacaoData);
export const deletarAvaliacao = (id) => api.delete(`/avaliacoes/${id}`);
export const getAvaliacaoById = (id) => api.get(`/avaliacoes/${id}`);
export const verificarSeUsuarioRespondeu = (idAvaliacao) => api.get(`/verificar-resposta/${idAvaliacao}`);
export const enviarAvaliacao = (id) => api.put(`/avaliacoes/${id}/enviar`);
export const prorrogarAvaliacao = (id, novaDataFim) => api.put(`/avaliacoes/${id}/prorrogar`, { data_fim: novaDataFim });
