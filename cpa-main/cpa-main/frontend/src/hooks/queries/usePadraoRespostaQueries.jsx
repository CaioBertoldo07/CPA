import { useQuery } from '@tanstack/react-query';
import { getPadraoResposta, getPadraoRespostaById } from '../../api/padraoResposta';

export const useGetPadraoRespostaQuery = () => {
    return useQuery({
        queryKey: ['padrao-resposta'],
        queryFn: getPadraoResposta,
    });
};

export const useGetPadraoRespostaByIdQuery = (id) => {
    return useQuery({
        queryKey: ['padrao-resposta', id],
        queryFn: () => getPadraoRespostaById(id),
        enabled: !!id,
    });
};
