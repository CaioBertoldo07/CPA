import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    IoDocumentTextOutline,
    IoHelpCircleOutline,
} from 'react-icons/io5';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const navItems = [
    { id: 'avaliacoes', label: 'Minhas Avaliações', path: '/avaliadores/avaliacoes', icon: IoDocumentTextOutline },
    { id: 'ajuda',      label: 'Ajuda',             path: '/avaliadores/ajuda',      icon: IoHelpCircleOutline },
];

const SidebarContent = ({ onNavigate, collapsed }) => {
    const { pathname } = useLocation();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'white',
                borderRight: '1px solid',
                borderColor: 'divider',
                width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
                transition: 'width 0.2s ease',
                overflow: 'hidden',
            }}
        >
            {/* Top spacing for fixed AppBar */}
            <Box sx={{ height: 64, flexShrink: 0 }} />

            {!collapsed && (
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            color: 'text.disabled',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            fontSize: '0.65rem',
                        }}
                    >
                        Menu
                    </Typography>
                </Box>
            )}

            <List sx={{ px: collapsed ? 1 : 1.5, py: 1, flex: 1 }}>
                {navItems.map(({ id, label, path, icon: Icon }) => {
                    const isActive = pathname === path;

                    const button = (
                        <ListItemButton
                            onClick={() => onNavigate(path)}
                            sx={{
                                borderRadius: '10px',
                                mb: 0.5,
                                minHeight: 44,
                                px: collapsed ? 1.5 : 1.75,
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                bgcolor: isActive ? 'primary.main' : 'transparent',
                                color: isActive ? 'white' : 'text.secondary',
                                position: 'relative',
                                '&:hover': {
                                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                                },
                                ...(isActive && !collapsed && {
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: -6,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 4,
                                        height: 24,
                                        bgcolor: 'primary.main',
                                        borderRadius: '0 4px 4px 0',
                                    },
                                }),
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: collapsed ? 0 : 36,
                                    color: 'inherit',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon size={20} />
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText
                                    primary={label}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.875rem',
                                    }}
                                />
                            )}
                        </ListItemButton>
                    );

                    return (
                        <ListItem key={id} disablePadding>
                            {collapsed ? (
                                <Tooltip title={label} placement="right">
                                    {button}
                                </Tooltip>
                            ) : (
                                button
                            )}
                        </ListItem>
                    );
                })}
            </List>

            <Divider />

            {!collapsed && (
                <Box sx={{ px: 2.5, py: 2 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                        CPA UEA © 2024
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

const SidebarAvaliador = ({ mobileOpen, onMobileClose, collapsed }) => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <>
            {/* Mobile: temporary Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: SIDEBAR_WIDTH,
                        boxSizing: 'border-box',
                        border: 'none',
                    },
                }}
            >
                <SidebarContent
                    onNavigate={(path) => { handleNavigate(path); onMobileClose(); }}
                    collapsed={false}
                />
            </Drawer>

            {/* Desktop: permanent Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
                        boxSizing: 'border-box',
                        border: 'none',
                        transition: 'width 0.2s ease',
                        overflowX: 'hidden',
                    },
                }}
            >
                <SidebarContent onNavigate={handleNavigate} collapsed={collapsed} />
            </Drawer>
        </>
    );
};

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
export default SidebarAvaliador;
