import api from './apiConfig';

export const getMunicipios = async () => {
    try {
        const response = await api.get('/municipios');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar municípios:', error);
        throw error;
    }
};

export const getMunicipioById = async (id) => {
    try {
        const response = await api.get(`/municipios/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar município por ID:', error);
        throw error;
    }
};
