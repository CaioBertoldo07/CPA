import api from './apiConfig';
import axios from 'axios';


export const getEixos = async () => {
    try {
      const response = await api.get('/eixos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eixos:', error);
      throw error;
    }
  };
  
  export const getEixoByNumero = async (id) => {
    try {
      const response = await api.get(`/eixos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eixo:', error);
      throw error;
    }
  };
  
  export const cadastrarEixo = async (eixo) => {
    try {
      const response = await api.post('/eixos', eixo);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar eixo:', error);
      throw error;
    }
  };
  
  export const editarEixo = async (eixo) => {
    const { numero, nome } = eixo;
    try {
      const response = await api.put(`/eixos/${numero}`, { nome });
      return response.data;
    } catch (error) {
      console.error('Erro ao editar eixo:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  
  export const deletarEixo = async (id) => {
    try {
      const response = await api.delete(`/eixos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar eixo:', error);
      throw error;
    }
  };

  