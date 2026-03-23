import { useQuery } from '@tanstack/react-query';
import {
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    verificarSeUsuarioRespondeu
} from '../../api/avaliacoes';

export const useGetAvaliacoesQuery = () => {
    return useQuery({
        queryKey: ['avaliacoes'],
        queryFn: getAvaliacoes,
    });
};

export const useGetAvaliacoesDisponiveisQuery = () => {
    return useQuery({
        queryKey: ['avaliacoes', 'disponiveis'],
        queryFn: getAvaliacoesDisponiveis,
    });
};

export const useGetAvaliacaoByIdQuery = (id) => {
    return useQuery({
        queryKey: ['avaliacoes', id],
        queryFn: () => getAvaliacaoById(id),
        enabled: !!id,
    });
};

export const useGetVerificarRespostaQuery = (idAvaliacao) => {
    return useQuery({
        queryKey: ['verificar-resposta', idAvaliacao],
        queryFn: () => verificarSeUsuarioRespondeu(idAvaliacao),
        enabled: !!idAvaliacao,
    });
};
