import api from "./apiConfig";

// Função para obter todas as alternativas
export const getAlternativas = async () => {
    try {
        const response = await api.get('/alternativas');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar alternativas:', error);
        throw error;
    }
};

// Função para obter uma alternativa pelo ID
export const getAlternativaById = async (id) => {
    try {
        const response = await api.get(`/alternativas/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar alternativa:', error);
        throw error;
    }
};
export const getAlternativasByPadraoRespostaId = async (id) => {
    try{
        const response = await api.get(`/alternativas/byIdPadrao/${id}`);
        return response.data;
    }catch(error){
        console.error('Erro ao buscar alternativas:', error);
        throw error;
    }
};

// Função para cadastrar uma nova alternativa
export const cadastrarAlternativa = async (alternativa) => {
    try {
        const response = await api.post('/alternativas', alternativa);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar alternativa:', error);
        throw error;
    }
};

// Função para editar uma alternativa existente
export const editarAlternativa = async (id, alternativa) => {
    try {
        const response = await api.put(`/alternativas/${id}`, alternativa);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao editar alternativa:', error);
        throw error;
    }
};

// Função para deletar uma alternativa pelo ID
export const deletarAlternativa = async (id) => {
    try {
        const response = await api.delete(`/alternativas/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar alternativa:', error);
        throw error;
    }
};
