import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveRespostas } from '../../api/respostas';

export const useAdicionarRespostaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveRespostas,
        onSuccess: () => {
            // Depending on how responses are used, you might want to invalidate other queries
            queryClient.invalidateQueries({ queryKey: ['respostas'] });
        },
    });
};
