import api from './index';

export const getAlternativas = () => api.get('/alternativas');
export const getAlternativaById = (id) => api.get(`/alternativas/${id}`);
export const getAlternativasByPadraoRespostaId = (id) => api.get(`/alternativas/byIdPadrao/${id}`);
export const cadastrarAlternativa = (alternativa) => api.post('/alternativas', alternativa);
export const editarAlternativa = (id, alternativa) => api.put(`/alternativas/${id}`, alternativa);
export const deletarAlternativa = (id) => api.delete(`/alternativas/${id}`);
