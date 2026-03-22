import { useQuery } from '@tanstack/react-query';
import { getDimensoes, getDimensaoByNumero, getDimensoesByEixo } from '../../api/dimensoes';

export const useGetDimensoesQuery = () => {
    return useQuery({
        queryKey: ['dimensoes'],
        queryFn: getDimensoes,
    });
};

export const useGetDimensaoByNumeroQuery = (numero) => {
    return useQuery({
        queryKey: ['dimensoes', 'numero', numero],
        queryFn: () => getDimensaoByNumero(numero),
        enabled: !!numero,
    });
};

export const useGetDimensoesByEixoQuery = (eixoNumero) => {
    return useQuery({
        queryKey: ['dimensoes', 'eixo', eixoNumero],
        queryFn: () => getDimensoesByEixo(eixoNumero),
        enabled: !!eixoNumero,
    });
};
