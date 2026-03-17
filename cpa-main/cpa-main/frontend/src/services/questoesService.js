import api from './apiConfig';

// Função para obter todas as questões
export const getQuestoes = async () => {
    try {
        const response = await api.get('/questoes');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Função para buscar uma questão específica, incluindo categorias e modalidades
export const getQuestaoById = async (id) => {
    try {
        const response = await api.get(`/questoes/${id}`);
        return response.data; // Devolve os dados da questão com categorias e modalidades
    } catch (error) {
        throw error;
    }
};

// Função para cadastrar uma nova questão
export const cadastrarQuestoes = async (questao) => {
    try {
        const response = await api.post('/questoes', questao);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Função para atualizar uma questão existente
export const updateQuestao = async (id, questao) => {
    try {
        const response = await api.put(`/questoes/${id}`, questao);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Função para deletar uma questão
export const deleteQuestoes = async (id) => {
    try {
        const response = await api.delete(`/questoes/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
