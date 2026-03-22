import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, isAdminRequired, ...rest }) => {
    const token = localStorage.getItem('authToken');
    const userIsAdmin = localStorage.getItem('isAdmin') === 'true';

    // Verificar se o token existe e se está expirado
    if (!token) {
        return <Navigate to="/login" />;
    }



    if (isAdminRequired && !userIsAdmin) {
        alert('Você não tem acesso a esta página.');
        return <Navigate to="/alunos" />;
    }

    return <Component {...rest} />;
};

export default ProtectedRoute;
