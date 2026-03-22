import api from './index';

export const getAdmins = () => api.get('/admin/');
export const cadastrarAdmin = (data) => api.post('/admin/', data);
export const updateAdmin = (id, data) => api.put(`/admin/${id}`, data);
export const deleteAdmin = (id) => api.delete(`/admin/${id}`);
