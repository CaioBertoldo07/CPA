import { useQuery } from '@tanstack/react-query';
import { getQuestoes, getQuestaoById } from '../../api/questoes';

export const useGetQuestoesQuery = () => {
    return useQuery({
        queryKey: ['questoes'],
        queryFn: getQuestoes,
    });
};

export const useGetQuestaoByIdQuery = (id) => {
    return useQuery({
        queryKey: ['questoes', id],
        queryFn: () => getQuestaoById(id),
        enabled: !!id,
    });
};
