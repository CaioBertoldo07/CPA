import api from './index';

export const saveRespostas = (respostas) => api.post('/respostas', respostas);

export const getRespostasPorAvaliacao = (idAvaliacao, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/avaliacoes/${idAvaliacao}/respostas${params ? `?${params}` : ''}`);
};
export const getRelatorioDisciplinas = (idAvaliacao, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/avaliacoes/${idAvaliacao}/relatorio/disciplinas${params ? `?${params}` : ''}`);
};
export const getDashboardCategorias = () => api.get('/dashboard/estatisticas-categorias');

