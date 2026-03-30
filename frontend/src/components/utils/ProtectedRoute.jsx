import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useGetCurrentUserQuery } from '../../hooks/queries/useAuthQueries';

const ProtectedRoute = ({ element: Component, isAdminRequired = false, layout: Layout, ...rest }) => {
    const { data: user, isLoading, isError } = useGetCurrentUserQuery();

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !user) {
        return <Navigate to="/login" />;
    }

    if (isAdminRequired && !user.isAdmin) {
        window.dispatchEvent(new CustomEvent('auth:access-denied'));
        return <Navigate to="/avaliadores/avaliacoes" />;
    }

    const content = <Component {...rest} />;
    return Layout ? <Layout>{content}</Layout> : content;
};

export default ProtectedRoute;
