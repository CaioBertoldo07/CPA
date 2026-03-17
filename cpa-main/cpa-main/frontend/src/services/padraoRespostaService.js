import api from "./apiConfig";

export const getPadraoResposta = async () => {
    try {
        const response = await api.get('/padraoresposta');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPadraoRespostaById = async (id) => {
    try {
        const response = await api.get(`/padraoresposta/${id}`);
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar padrão de resposta:', error);
        throw error;
      }
};

export const cadastrarPadraoResposta = async (padraoResposta) => {
    try {
        const response = await api.post('/padraoresposta', padraoResposta);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar padrão de resposta:', error);
        throw error;
    }
};

export const editarPadraoResposta = async (id, padraoResposta) => {
    try {
        // console.log(id, padraoResposta,"Editaaaaar");
        const response = await api.put(`/padraoresposta/${id}`, padraoResposta);
        return response.data;
    } catch (error) {
        console.error('Erro ao editar padrão de resposta:', error);
        throw error;
    }
};

export const deletarPadraoResposta = async (id) => {
    try {
        const response = await api.delete(`/padraoresposta/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar padrão de resposta:', error);
        throw error;
    }
};