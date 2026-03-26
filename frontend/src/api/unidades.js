import api from './index';

export const getUnidades = () => api.get('/unidades');
export const getUnidadeById = (id) => api.get(`/unidades/${id}`);
export const getUnidadesByMunicipios = (municipiosNomes) => api.get('/unidades/municipios', {
    params: { municipiosNomes: municipiosNomes.join(',') }
});
