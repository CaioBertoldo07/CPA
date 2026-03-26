import api from './index';

export const getModalidades = () => api.get('/modalidades');
export const getModalidadeByNumero = (id) => api.get(`/modalidades/${id}`);
export const cadastrarModalidades = (modalidades) => api.post('/modalidades', modalidades);
export const updateModalidades = (id, updatedData) => api.put(`/modalidades/${id}`, updatedData);
export const deleteModalidades = (id) => api.delete(`/modalidades/${id}`);
