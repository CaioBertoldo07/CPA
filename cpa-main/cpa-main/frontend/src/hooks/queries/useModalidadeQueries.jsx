import { useQuery } from '@tanstack/react-query';
import { getModalidades, getModalidadeByNumero } from '../../api/modalidades';

export const useGetModalidadesQuery = () => {
    return useQuery({
        queryKey: ['modalidades'],
        queryFn: getModalidades,
    });
};

export const useGetModalidadeByNumeroQuery = (id) => {
    return useQuery({
        queryKey: ['modalidades', id],
        queryFn: () => getModalidadeByNumero(id),
        enabled: !!id,
    });
};
