import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadastrarQuestoes, updateQuestao, deleteQuestoes } from '../../api/questoes';

export const useAdicionarQuestaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cadastrarQuestoes,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questoes'] });
        },
    });
};

export const useEditQuestaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, questao }) => updateQuestao(id, questao),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questoes'] });
        },
    });
};

export const useDeleteQuestaoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteQuestoes,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questoes'] });
        },
    });
};
