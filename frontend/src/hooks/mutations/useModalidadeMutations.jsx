import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadastrarModalidades, updateModalidades, deleteModalidades } from '../../api/modalidades';

export const useAdicionarModalidadeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cadastrarModalidades,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modalidades'] });
        },
    });
};

export const useEditModalidadeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateModalidades(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modalidades'] });
        },
    });
};

export const useDeleteModalidadeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteModalidades,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modalidades'] });
        },
    });
};
