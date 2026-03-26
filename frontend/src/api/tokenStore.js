
export const getToken = () => localStorage.getItem('authToken');
export const setToken = (token) => localStorage.setItem('authToken', token);

export const setIsAdmin = (value) => localStorage.setItem('isAdmin', String(!!value));
export const getIsAdmin = () => localStorage.getItem('isAdmin') === 'true';

export const setUserEmail = (email) => localStorage.setItem('userEmail', email);
export const getUserEmail = () => localStorage.getItem('userEmail');

export const clearAll = () => localStorage.clear();
