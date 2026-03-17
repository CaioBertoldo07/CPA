import api from './apiConfig';

export const getCursosByUnidades = async (unidadeIds) => {
    try {
        // Verifica se unidadeIds é um array e, se não for, o converte em um array
        const ids = Array.isArray(unidadeIds) ? unidadeIds : [unidadeIds];
        const idsString = ids.join(',');

        const response = await api.get(`/cursos/by-unidades?unidadeIds=${idsString}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        throw error;
    }
};
