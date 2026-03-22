import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadastrarDimensao, editarDimensao, updateDimensaoByNumero, deletarDimensao } from '../../api/dimensoes';

export const useAdicionarDimensaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cadastrarDimensao,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dimensoes'] });
        },
    });
};

export const useEditDimensaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dimensao }) => editarDimensao(id, dimensao),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dimensoes'] });
        },
    });
};

export const useUpdateDimensaoByNumeroMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ numero, data }) => updateDimensaoByNumero(numero, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dimensoes'] });
        },
    });
};

export const useDeleteDimensaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletarDimensao,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dimensoes'] });
        },
    });
};
