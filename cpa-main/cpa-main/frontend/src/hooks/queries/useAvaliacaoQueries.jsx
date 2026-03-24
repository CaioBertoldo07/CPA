import { useQuery } from '@tanstack/react-query';
import {
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    verificarSeUsuarioRespondeu
} from '../../api/avaliacoes';

export const useGetAvaliacoesQuery = (paginationModel = { page: 0, pageSize: 10 }) => {
    return useQuery({
        queryKey: ['avaliacoes', paginationModel.page, paginationModel.pageSize],
        queryFn: () => getAvaliacoes(paginationModel.page, paginationModel.pageSize),
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
