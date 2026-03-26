import { useQuery } from '@tanstack/react-query';
import { getRespostasPorAvaliacao, getRelatorioDisciplinas } from '../../api/respostas';

export const useGetRespostasPorAvaliacaoQuery = (idAvaliacao, filters = {}) => {
    return useQuery({
        queryKey: ['respostas', 'avaliacao', idAvaliacao, filters],
        queryFn: () => getRespostasPorAvaliacao(idAvaliacao, filters),
        enabled: !!idAvaliacao,
    });
};

export const useGetRespostasPorDisciplinaQuery = (idAvaliacao, filters = {}) => {
    return useQuery({
        queryKey: ['respostas', 'disciplinas', idAvaliacao, filters],
        queryFn: () => getRelatorioDisciplinas(idAvaliacao, filters),
        enabled: !!idAvaliacao,
    });
};
