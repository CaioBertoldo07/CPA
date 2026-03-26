import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadastrarCategoria, updateCategoria, deleteCategoria } from '../../api/categorias';

export const useAdicionarCategoriaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cadastrarCategoria,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
    });
};

export const useEditCategoriaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, categoria }) => updateCategoria(id, categoria),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
    });
};

export const useDeleteCategoriaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCategoria,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
    });
};
