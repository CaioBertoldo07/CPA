import { useQuery } from '@tanstack/react-query';
import { getRespostasPorAvaliacao, getDashboardCategorias } from '../../api/respostas';

export const useGetRespostasPorAvaliacaoQuery = (idAvaliacao) => {
    return useQuery({
        queryKey: ['respostas', 'avaliacao', idAvaliacao],
        queryFn: () => getRespostasPorAvaliacao(idAvaliacao),
        enabled: !!idAvaliacao,
    });
};

export const useGetDashboardCategoriasQuery = () => {
    return useQuery({
        queryKey: ['dashboard', 'categorias'],
        queryFn: getDashboardCategorias,
        retry: false,
    });
};
