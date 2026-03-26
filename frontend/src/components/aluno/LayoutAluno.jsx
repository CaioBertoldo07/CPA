import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../../api/tokenStore';
import HeaderAluno from './HeaderAluno';
import SidebarAluno, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './SidebarAluno';

const LayoutAluno = ({ children }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const token = getToken();
    const [usuarioNome, setUsuarioNome] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        try {
            const decoded = jwtDecode(token);
            setUsuarioNome(decoded.usuarioNome || 'Usuário');
        } catch {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const collapsed = isTablet;
    const sidebarWidth = isMobile ? 0 : collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <SidebarAluno
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
                    ml: `${sidebarWidth}px`,
                    transition: 'margin-left 0.2s ease',
                    minWidth: 0,
                }}
            >
                <HeaderAluno
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

                {/* <Box
                    component="footer"
                    sx={{
                        py: 2.5,
                        px: { xs: 2, sm: 3, md: 4 },
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'white',
                    }}
                >
                </Box> */}
            </Box>
        </Box>
    );
};

export default LayoutAluno;
