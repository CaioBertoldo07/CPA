import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
    getAvaliacoes,
    getAvaliacoesDisponiveis,
    getAvaliacaoById,
    verificarSeUsuarioRespondeu
} from '../../api/avaliacoes';

export const useGetAvaliacoesQuery = ({ page = 0, pageSize = 10, status, search, columnFilters } = {}) => {
    const filtersKey = columnFilters?.length ? JSON.stringify(columnFilters) : '';
    return useQuery({
        queryKey: ['avaliacoes', page, pageSize, status ?? null, search ?? '', filtersKey],
        queryFn: () => getAvaliacoes(page, pageSize, {
            ...(status != null && { status }),
            ...(search ? { search } : {}),
            ...(columnFilters?.length ? { columnFilters: JSON.stringify(columnFilters) } : {}),
        }),
        placeholderData: keepPreviousData,
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
