import { useQuery } from '@tanstack/react-query';
import { getUnidades, getUnidadeById, getUnidadesByMunicipios } from '../../api/unidades';

export const useGetUnidadesQuery = () => {
    return useQuery({
        queryKey: ['unidades'],
        queryFn: getUnidades,
    });
};

export const useGetUnidadeByIdQuery = (id) => {
    return useQuery({
        queryKey: ['unidades', id],
        queryFn: () => getUnidadeById(id),
        enabled: !!id,
    });
};

export const useGetUnidadesByMunicipiosQuery = (municipiosNomes) => {
    return useQuery({
        queryKey: ['unidades', 'by-municipios', municipiosNomes],
        queryFn: () => getUnidadesByMunicipios(municipiosNomes),
        enabled: !!municipiosNomes && municipiosNomes.length > 0,
    });
};
