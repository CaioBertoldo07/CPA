import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classifyCursos } from '../../api/cursos';

export const useClassifyCursosMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ cursoIds, idModalidade }) => classifyCursos(cursoIds, idModalidade),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cursos'] });
            queryClient.invalidateQueries({ queryKey: ['modalidades'] });
        },
    });
};
