// src/services/dimensoesService.js
import api from './apiConfig';
import { getEixoByNumero } from './eixosService';

export const getDimensaoByNumero = async (numero) => {
    const response = await api.get(`/dimensoes/numero/${numero}`);
    return response.data;
};

export const updateDimensao = async (numero, data) => {
    try {
        // Verificar se o eixo associado à dimensão existe
        const eixo = await getEixoByNumero(data.numero_eixos);
        if (!eixo) {
            throw new Error('Número de eixo fornecido não existe.');
        }

        // Atualizar a dimensão
        const response = await api.put(`/dimensoes/${numero}`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar dimensão:', error);
        throw error;
    }
};

export const getDimensoes = async () => {
    try {
        const response = await api.get(`/dimensoes`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const cadastrarDimensao = async (dimensao) => {
    try {
        const response = await api.post(`/dimensoes`, dimensao);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar dimensão:', error);
        throw error;
    }
};

export const editarDimensao = async (id, dimensao) => {
    try {
        const response = await api.put(`/dimensoes/${id}`, dimensao);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletarDimensao = async (id) => {
    try {
        const response = await api.delete(`/dimensoes/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getDimensoesByEixo = async (eixoNumero) => {
    try {
        const response = await api.get(`/dimensoes/eixo/${eixoNumero}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar dimensões:', error);
        throw error;
    }
};
