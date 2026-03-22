import { useQuery } from '@tanstack/react-query';
import { getTiposQuestoes } from '../../api/tiposQuestao';

export const useGetTiposQuestoesQuery = () => {
    return useQuery({
        queryKey: ['tipos-questoes'],
        queryFn: getTiposQuestoes,
    });
};
