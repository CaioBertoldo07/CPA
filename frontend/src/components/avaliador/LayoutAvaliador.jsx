import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { logout } from '../../api/auth';
import { useGetCurrentUserQuery } from '../../hooks/queries/useAuthQueries';
import HeaderAvaliador from './HeaderAvaliador';
import SidebarAvaliador from './SidebarAvaliador';

const LayoutAvaliador = ({ children }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [usuarioNome, setUsuarioNome] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const { data: currentUser, isError } = useGetCurrentUserQuery();

    useEffect(() => {
        if (isError) {
            navigate('/login');
            return;
        }

        setUsuarioNome(currentUser?.usuarioNome || currentUser?.nome || 'Usuário');
    }, [currentUser, isError, navigate]);

    const handleLogout = () => {
        void logout();
    };

    const collapsed = isTablet;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <SidebarAvaliador
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
                collapsed={collapsed}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                }}
            >
                <HeaderAvaliador
                    usuarioNome={usuarioNome}
                    onLogout={handleLogout}
                    onMenuToggle={() => setMobileOpen(o => !o)}
                    showMenuButton={isMobile}
                />

                {/* Page content — offset for fixed AppBar + centered container */}
                <Box sx={{ mt: '64px', flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>
                    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LayoutAvaliador;
