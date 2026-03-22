import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadastrarAdmin, updateAdmin, deleteAdmin } from '../../api/admin';

export const useAdicionarAdminMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cadastrarAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
        },
    });
};

export const useEditAdminMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateAdmin(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
        },
    });
};

export const useDeleteAdminMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
        },
    });
};
