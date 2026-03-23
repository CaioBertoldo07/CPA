import api from './index';

export const getCursosByUnidades = (unidadeIds) => {
    const ids = Array.isArray(unidadeIds) ? unidadeIds : [unidadeIds];
    return api.get(`/cursos/by-unidades`, { params: { unidadeIds: ids.join(',') } });
};
