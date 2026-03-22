import api from './index';

export const saveRespostas = (respostas) => api.post('/respostas', respostas);
export const getRespostasPorAvaliacao = (idAvaliacao) => api.get(`/avaliacoes/${idAvaliacao}/respostas`);
