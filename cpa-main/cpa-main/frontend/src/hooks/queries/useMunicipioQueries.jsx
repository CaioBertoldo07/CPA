import { useQuery } from '@tanstack/react-query';
import { getMunicipios, getMunicipioById } from '../../api/municipios';

export const useGetMunicipiosQuery = () => {
    return useQuery({
        queryKey: ['municipios'],
        queryFn: getMunicipios,
    });
};

export const useGetMunicipioByIdQuery = (id) => {
    return useQuery({
        queryKey: ['municipios', id],
        queryFn: () => getMunicipioById(id),
        enabled: !!id,
    });
};
