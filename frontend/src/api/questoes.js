import api from './index';

export const getQuestoes = () => api.get('/questoes');
export const getQuestaoById = (id) => api.get(`/questoes/${id}`);
export const cadastrarQuestoes = (questao) => api.post('/questoes', questao);
export const updateQuestao = (id, questao) => api.put(`/questoes/${id}`, questao);
export const deleteQuestoes = (id) => api.delete(`/questoes/${id}`);
