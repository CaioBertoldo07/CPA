import { useQuery } from '@tanstack/react-query';
import { getCursosByUnidades } from '../../api/cursos';

export const useGetCursosByUnidadesQuery = (unidadeIds) => {
    return useQuery({
        queryKey: ['cursos', 'by-unidades', unidadeIds],
        queryFn: () => getCursosByUnidades(unidadeIds),
        enabled: !!unidadeIds && (Array.isArray(unidadeIds) ? unidadeIds.length > 0 : true),
    });
};
