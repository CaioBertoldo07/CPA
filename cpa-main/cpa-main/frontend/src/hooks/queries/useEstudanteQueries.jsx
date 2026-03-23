import { useQuery } from '@tanstack/react-query';
import { getHistoricoMatricula } from '../../api/estudantes';

/**
 * Hook to fetch student academic history.
 */
export const useGetHistoricoMatriculaQuery = (ano = 2024, semestre = 2) => {
    return useQuery({
        queryKey: ['historicoMatricula', ano, semestre],
        queryFn: () => getHistoricoMatricula(ano, semestre),
        staleTime: 1000 * 60 * 60, // 1 hour (academic history doesn't change often)
    });
};
