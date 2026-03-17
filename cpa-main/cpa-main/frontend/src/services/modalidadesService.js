import api from './apiConfig';
import axios from 'axios';

export const getModalidades = async () => {
    try {
      const response = await api.get('/modalidades');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
      throw error;
    }
};

export const cadastrarModalidades = async (modalidades) => {
    try {
      const response = await api.post('/modalidades', modalidades);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar modalidade:', error);
      throw error;
    }
};

export const getModalidadesByNumero = async (id) => {
    try {
      const response = await api.get(`/modalidades/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar modalidade:', error);
      throw error;
    }
};

export const updateModalidades = async (id, updatedData) => {
    try {
        const response = await api.put(`/modalidades/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar modalidade:", error);
        throw error;
    }
};

export const deleteModalidades = async (id) => {
    try {
      const response = await api.delete(`/modalidades/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar modalidade:', error);
      throw error;
    }
};
