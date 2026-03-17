import api from './apiConfig'; // Importando a configuração da API

// Função para enviar respostas
export const saveRespostas = async (respostas, token) => {
    try {
        console.log('Enviando respostas para o backend: ', respostas);

        const response = await api.post('/respostas',
            respostas,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

        return response.data;
    } catch (error) {
        console.error('Erro ao salvar respostas:', error);
        if (error.response) {
            console.error('Erro de resposta da API:', error.response.data);
        } else {
            console.error('Erro sem resposta da API:', error.message);
        }
        throw error;
    }
};

// Função para obter respostas por avaliação
export const getRespostasPorAvaliacao = async (idAvaliacao, token) => {
    try {
        console.log(`Buscando respostas para a avaliação ${idAvaliacao}`);

        const response = await api.get(`/avaliacoes/${idAvaliacao}/respostas`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar respostas para a avaliação ${idAvaliacao}:`, error);
        if (error.response) {
            console.error('Erro de resposta da API:', error.response.data);
        } else {
            console.error('Erro sem resposta da API:', error.message);
        }
        throw error;
    }
};