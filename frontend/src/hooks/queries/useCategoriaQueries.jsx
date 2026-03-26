import { useQuery } from '@tanstack/react-query';
import { getCategorias } from '../../api/categorias';

export const useGetCategoriasQuery = () => {
    return useQuery({
        queryKey: ['categorias'],
        queryFn: getCategorias,
    });
};
