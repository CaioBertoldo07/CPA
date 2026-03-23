import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadastrarAlternativa, editarAlternativa, deletarAlternativa } from '../../api/alternativas';

export const useAdicionarAlternativaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cadastrarAlternativa,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alternativas'] });
        },
    });
};

export const useEditAlternativaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, alternativa }) => editarAlternativa(id, alternativa),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alternativas'] });
        },
    });
};

export const useDeleteAlternativaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletarAlternativa,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alternativas'] });
        },
    });
};
