import api from './index';

export const getCursosByUnidades = (unidadeIds, modalidadeIds = []) => {
    const ids = (Array.isArray(unidadeIds) ? unidadeIds : [unidadeIds])
        .map(id => Number(id))
        .filter(id => Number.isFinite(id));
    const modIds = (Array.isArray(modalidadeIds) ? modalidadeIds : [modalidadeIds])
        .map(id => Number(id))
        .filter(id => Number.isFinite(id));

    const params = {
        unidadeIds: ids.join(','),
        modalidadeIds: modIds.join(','),
    };

    return api.get(`/cursos`, { params });
};

export const getCursosByModalidades = (modalidadeIds) => {
    const ids = Array.isArray(modalidadeIds) ? modalidadeIds : [modalidadeIds];
    return api.get('/cursos/by-modalidades', { params: { modalidadeIds: ids.join(',') } });
};

export const getPaginatedCursos = (params) => {
    return api.get('/cursos/paginated', { params });
};

export const classifyCursos = (cursoIds, idModalidade) => {
    return api.post(`/cursos/classify`, { cursoIds, idModalidade });
};

export const getCursoTypes = () => {
    return api.get('/cursos/tipos');
};

export const updateCursosStatus = ({ cursoIds, ativo }) =>
    api.patch('/cursos/status', { cursoIds, ativo });

