import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadastrarEixo, editarEixo, deletarEixo } from '../../api/eixos';

export const useAdicionarEixoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cadastrarEixo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eixos'] });
        },
    });
};

export const useEditEixoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ numero, data }) => editarEixo(numero, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eixos'] });
        },
    });
};

export const useDeleteEixoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletarEixo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eixos'] });
        },
    });
};
