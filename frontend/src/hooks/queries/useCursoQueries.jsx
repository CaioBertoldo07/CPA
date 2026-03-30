import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getCursosByUnidades, getCursosByModalidades, getPaginatedCursos, getCursoTypes } from '../../api/cursos';

export const useGetCursosByUnidadesQuery = (unidadeIds, modalidadeIds = []) => {
    const unidadeIdsSafe = (Array.isArray(unidadeIds) ? unidadeIds : [])
        .map(id => Number(id))
        .filter(id => Number.isFinite(id));
    const modalidadeIdsSafe = (Array.isArray(modalidadeIds) ? modalidadeIds : [])
        .map(id => Number(id))
        .filter(id => Number.isFinite(id));

    return useQuery({
        queryKey: ['cursos', 'filtered', unidadeIdsSafe, modalidadeIdsSafe],
        queryFn: () => getCursosByUnidades(unidadeIdsSafe, modalidadeIdsSafe),
        enabled: unidadeIdsSafe.length > 0 && modalidadeIdsSafe.length > 0,
    });
};

export const useGetPaginatedCursosQuery = (params) => {
    return useQuery({
        queryKey: ['cursos', 'paginated', params],
        queryFn: () => getPaginatedCursos(params),
        placeholderData: keepPreviousData,
    });
};

export const useGetCursoTypesQuery = () => {
    return useQuery({
        queryKey: ['cursos', 'types'],
        queryFn: getCursoTypes,
    });
};

export const useGetCursosByModalidadesQuery = (modalidadeIds) => {
    const ids = Array.isArray(modalidadeIds) ? modalidadeIds : [modalidadeIds];
    return useQuery({
        queryKey: ['cursos', 'by-modalidades', ids],
        queryFn: () => getCursosByModalidades(ids),
        enabled: ids.length > 0 && ids.every(id => Number.isFinite(Number(id))),
    });
};