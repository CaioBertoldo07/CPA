import api from './apiConfig';

// Função para buscar unidades por uma lista de nomes de municípios
export const getUnidadesByMunicipios = async (municipiosNomes) => {
    try {
        const response = await api.get('/unidades/municipios', {
            params: {
                municipiosNomes: municipiosNomes.join(',') // Converte o array em string separada por vírgulas
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar unidades por municípios:', error);
        throw error;
    }
};

// Outras funções
export const getUnidades = async () => {
    try {
        const response = await api.get('/unidades');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar unidades:', error);
        throw error;
    }
};

export const getUnidadeById = async (id) => {
    try {
        const response = await api.get(`/unidades/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar unidade por ID:', error);
        throw error;
    }
};
