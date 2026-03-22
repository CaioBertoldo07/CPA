import { useQuery } from '@tanstack/react-query';
import { getEixos, getEixoByNumero } from '../../api/eixos';

export const useGetEixosQuery = () => {
    return useQuery({
        queryKey: ['eixos'],
        queryFn: getEixos,
    });
};

export const useGetEixoByNumeroQuery = (id) => {
    return useQuery({
        queryKey: ['eixos', id],
        queryFn: () => getEixoByNumero(id),
        enabled: !!id,
    });
};
