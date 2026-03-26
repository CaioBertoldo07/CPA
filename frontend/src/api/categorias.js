import api from './index';

export const getCategorias = () => api.get('/categorias');
export const cadastrarCategoria = (categoria) => api.post('/categorias/', categoria);
export const updateCategoria = (id, categoria) => api.put(`/categorias/${id}`, categoria);
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);
