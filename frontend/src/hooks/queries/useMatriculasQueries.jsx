import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getParticipacaoPorCurso, sincronizarMatriculados } from '../../api/matriculados';

export const useGetParticipacaoQuery = (idAvaliacao) => {
    return useQuery({
        queryKey: ['participacao', 'avaliacao', idAvaliacao],
        queryFn: () => getParticipacaoPorCurso(idAvaliacao),
        enabled: !!idAvaliacao,
        retry: false,
    });
};

export const useSincronizarMatriculadosMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sincronizarMatriculados,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participacao'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'categorias'] });
        },
    });
};
