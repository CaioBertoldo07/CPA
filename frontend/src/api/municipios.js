import api from './index';

export const getMunicipios = () => api.get('/municipios');
export const getMunicipioById = (id) => api.get(`/municipios/${id}`);
