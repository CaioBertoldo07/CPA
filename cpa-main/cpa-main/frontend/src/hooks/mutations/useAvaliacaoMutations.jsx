import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createAvaliacao,
    editarAvaliacao,
    deletarAvaliacao,
    enviarAvaliacao,
    prorrogarAvaliacao
} from '../../api/avaliacoes';

export const useAdicionarAvaliacaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAvaliacao,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
        },
    });
};

export const useEditAvaliacaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => editarAvaliacao(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
        },
    });
};

export const useDeleteAvaliacaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletarAvaliacao,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
        },
    });
};

export const useEnviarAvaliacaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: enviarAvaliacao,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
        },
    });
};

export const useProrrogarAvaliacaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, novaDataFim }) => prorrogarAvaliacao(id, novaDataFim),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
        },
    });
};
