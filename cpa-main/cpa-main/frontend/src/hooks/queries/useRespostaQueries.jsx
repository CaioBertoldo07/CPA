import { useQuery } from '@tanstack/react-query';
import { getRespostasPorAvaliacao } from '../../api/respostas';

export const useGetRespostasPorAvaliacaoQuery = (idAvaliacao) => {
    return useQuery({
        queryKey: ['respostas', 'avaliacao', idAvaliacao],
        queryFn: () => getRespostasPorAvaliacao(idAvaliacao),
        enabled: !!idAvaliacao,
    });
};
