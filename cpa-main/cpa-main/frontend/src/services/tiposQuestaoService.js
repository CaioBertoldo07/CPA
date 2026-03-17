// services/tiposQuestaoService.js

import api from './apiConfig';

export const getTiposQuestoes = async () => {
    try {
        const response = await api.get('/tipos/'); // Ajuste o caminho conforme necessário
        return response.data; // Aqui você já está pegando o formato que você mencionou.
    } catch (error) {
        throw error;
    }
};
