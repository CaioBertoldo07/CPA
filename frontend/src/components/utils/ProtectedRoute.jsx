import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getIsAdmin } from '../../api/tokenStore';

const ProtectedRoute = ({ element: Component, isAdminRequired = false, layout: Layout, ...rest }) => {
    const token = getToken();
    const userIsAdmin = getIsAdmin();

    // Verificar se o token existe e se está expirado
    if (!token) {
        return <Navigate to="/login" />;
    }

    if (isAdminRequired && !userIsAdmin) {
        window.dispatchEvent(new CustomEvent('auth:access-denied'));
        return <Navigate to="/alunos/avaliacoes" />;
    }

    const content = <Component {...rest} />;
    return Layout ? <Layout>{content}</Layout> : content;
};

export default ProtectedRoute;
