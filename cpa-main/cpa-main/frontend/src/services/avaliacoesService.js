// src/services/avaliacoesService.js
import api from './apiConfig';

// Função para buscar todas as avaliações
export const getAvaliacoes = async () => {
    try {
        const response = await api.get('/avaliacoes'); // Faz a requisição GET para buscar todas as avaliações
        return response.data; // Retorna a lista de avaliações
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        throw error; // Lança o erro para ser tratado onde a função for chamada
    }
};

export const getAvaliacoesDisponiveis = async (token) => {
    try {
        const response = await api.get('/avaliacoes/disponiveis', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar avaliações disponíveis:', error);
        throw error;
    }
};

// Função para criar uma nova avaliação
export const createAvaliacao = async (avaliacaoData) => {
    try {
        const response = await api.post('/avaliacoes', avaliacaoData); // Envia os dados da avaliação com POST
        return response.data; // Retorna a avaliação criada
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        throw error; // Lança o erro para ser tratado onde a função for chamada
    }
};

// Função para editar uma avaliação existente
export const editarAvaliacao = async (id, avaliacaoData) => {
    try {
        const response = await api.put(`/avaliacoes/${id}`, avaliacaoData); // Envia os dados de atualização com PUT
        return response.data; // Retorna os dados da avaliação atualizada
    } catch (error) {
        console.error('Erro ao editar avaliação:', error.response ? error.response.data : error.message);
        throw error; // Lança o erro para ser tratado onde a função for chamada
    }
};

// Função para deletar uma avaliação
export const deletarAvaliacao = async (id) => {
    try {
        const response = await api.delete(`/avaliacoes/${id}`); // Faz a requisição DELETE para remover a avaliação
        return response.data; // Retorna o resultado da exclusão
    } catch (error) {
        console.error('Erro ao deletar avaliação:', error);
        throw error; // Lança o erro para ser tratado onde a função for chamada
    }
};

export const getAvaliacaoById = async (id, token) => {
    try {
        const response = await api.get(`/avaliacoes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        // Depuração: logando a resposta da API
        console.log("Resposta da API:", response.data);
        
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar avaliação por ID:', error);
        throw error;
    }
};

// Função para verificar se o usuário já respondeu à avaliação
export const verificarSeUsuarioRespondeu = async (idAvaliacao, token) => {
    try {
        const response = await api.get(`/verificar-resposta/${idAvaliacao}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data.jaRespondeu; // Retorna o resultado da verificação como booleano
    } catch (error) {
        console.error('Erro ao verificar se o usuário respondeu à avaliação:', error);
        throw error; // Propaga o erro para ser tratado
    }
};

// ADICIONADO: chamar endpoint de envio de avaliação
export const enviarAvaliacao = async (id) => {
    try {
        const response = await api.put(`/avaliacoes/${id}/enviar`);
        return response.data;
    } catch (error) {
        // Repassa o erro com a mensagem do backend para exibir no frontend
        throw error.response?.data || { error: 'Erro ao enviar avaliação.' };
    }
};

// ADICIONADO: chamar endpoint de exclusão de avaliação
export const deletarAvaliacaoById = async (id) => {
    try {
        const response = await api.delete(`/avaliacoes/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Erro ao excluir avaliação.' };
    }
};

// ADICIONADO: chamar endpoint de prorrogação de avaliação
export const prorrogarAvaliacaoById = async (id, novaDataFim) => {
    try {
        const response = await api.put(`/avaliacoes/${id}/prorrogar`, {
            data_fim: novaDataFim
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Erro ao prorrogar avaliação.' };
    }
};
