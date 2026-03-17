import api from './apiConfig';

export const getCategorias = async () => {
    try {
        const response = await api.get('/categorias');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
    }
};

export const cadastrarCategoria = async (categoria) => {
    try {
        const response = await api.post('/categorias/', categoria);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteCategoria = async (id) => {
    try{
        const response = await api.delete(`/categorias/${id}`);
        return response.data;
    } catch (error){
        throw error;
    }
}

export const updateCategoria = async (id, categoria) => {
    try {
        const response = await api.put(`/categorias/${id}`, categoria);
        return response.data;
    } catch (error) {
        throw error;
    }
};