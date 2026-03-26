import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadastrarPadraoResposta, editarPadraoResposta, deletarPadraoResposta } from '../../api/padraoResposta';

export const useAdicionarPadraoRespostaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cadastrarPadraoResposta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['padrao-resposta'] });
        },
    });
};

export const useEditPadraoRespostaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, padraoResposta }) => editarPadraoResposta(id, padraoResposta),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['padrao-resposta'] });
        },
    });
};

export const useDeletePadraoRespostaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletarPadraoResposta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['padrao-resposta'] });
        },
    });
};
