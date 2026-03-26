import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Avatar,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
} from '@mui/material';
import { IoExitOutline, IoNotificationsOutline, IoMenuOutline } from 'react-icons/io5';
import logo from '../../assets/imgs/cpa_logo.svg';

const HeaderAluno = ({ usuarioNome, onLogout, onMenuToggle, showMenuButton }) => {
    const theme = useTheme();

    const initials = usuarioNome
        ? usuarioNome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
        : 'U';

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                bgcolor: 'white',
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: '64px !important' }}>
                {/* Left: menu button (mobile) + logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {showMenuButton && (
                        <IconButton
                            onClick={onMenuToggle}
                            size="small"
                            sx={{ color: 'text.secondary', mr: 0.5 }}
                        >
                            <IoMenuOutline size={22} />
                        </IconButton>
                    )}
                    <img src={logo} alt="CPA Logo" style={{ height: 36, width: 'auto' }} />
                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            height: 20,
                            width: '1px',
                            bgcolor: 'divider',
                            mx: 0.5,
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            fontWeight: 600,
                            color: 'text.secondary',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            fontSize: '0.65rem',
                        }}
                    >
                        Portal do Aluno
                    </Typography>
                </Box>

                {/* Right: notifications + user info + logout */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Notificações">
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <IoNotificationsOutline size={20} />
                        </IconButton>
                    </Tooltip>

                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            alignItems: 'center',
                            gap: 1.25,
                            ml: 1,
                            pl: 1.5,
                            borderLeft: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: 'primary.main',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                                {usuarioNome || 'Usuário'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                                Aluno
                            </Typography>
                        </Box>
                    </Box>

                    <Tooltip title="Sair">
                        <IconButton
                            onClick={onLogout}
                            size="small"
                            sx={{
                                ml: 0.5,
                                color: 'error.main',
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
                            }}
                        >
                            <IoExitOutline size={18} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default HeaderAluno;
