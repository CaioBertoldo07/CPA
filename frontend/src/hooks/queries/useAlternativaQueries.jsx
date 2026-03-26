import { useQuery } from '@tanstack/react-query';
import { getAlternativas, getAlternativaById, getAlternativasByPadraoRespostaId } from '../../api/alternativas';

export const useGetAlternativasQuery = () => {
    return useQuery({
        queryKey: ['alternativas'],
        queryFn: getAlternativas,
    });
};

export const useGetAlternativaByIdQuery = (id) => {
    return useQuery({
        queryKey: ['alternativas', id],
        queryFn: () => getAlternativaById(id),
        enabled: !!id,
    });
};

export const useGetAlternativasByPadraoRespostaIdQuery = (id) => {
    return useQuery({
        queryKey: ['alternativas', 'padrao-resposta', id],
        queryFn: () => getAlternativasByPadraoRespostaId(id),
        enabled: !!id,
    });
};
