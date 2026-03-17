import api from './apiConfig';

export const cadastrarAdmin = async (data) => {
    try {
        const response = await api.post('/admin/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateAdmin = async (id, data) => {
    try {
        const response = await api.put(`/admin/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAdmins = async () => {
    try {
        const response = await api.get('/admin/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteAdmin = async (id) => {
    try {
        const response = await api.delete(`/admin/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
