import { useQuery } from '@tanstack/react-query';
import { getCursosByUnidades, getPaginatedCursos } from '../../api/cursos';

export const useGetCursosByUnidadesQuery = (unidadeIds) => {
    return useQuery({
        queryKey: ['cursos', 'by-unidades', unidadeIds],
        queryFn: () => getCursosByUnidades(unidadeIds),
        enabled: !!unidadeIds && (Array.isArray(unidadeIds) ? unidadeIds.length > 0 : true),
    });
};

export const useGetPaginatedCursosQuery = (params) => {
    return useQuery({
        queryKey: ['cursos', 'paginated', params],
        queryFn: () => getPaginatedCursos(params),
        keepPreviousData: true,
    });
};
