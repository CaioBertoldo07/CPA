import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Button,
    AppBar,
    Toolbar,
    Avatar,
    IconButton,
    Tooltip,
    Skeleton,
    Chip,
    Divider,
    Paper,
    useTheme,
    alpha
} from '@mui/material';
import {
    IoExitOutline,
    IoNotificationsOutline,
    IoPlayOutline,
    IoCalendarOutline,
    IoCheckmarkCircleOutline
} from 'react-icons/io5';
import logo from '../assets/imgs/cpa_logo.svg';

import { useGetAvaliacoesDisponiveisQuery } from '../hooks/queries/useAvaliacaoQueries';
import { getToken } from '../api/tokenStore';

const Alunos = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const token = getToken();
    const { data: avaliacoes = [], isLoading } = useGetAvaliacoesDisponiveisQuery();
    const [usuarioNome, setUsuarioNome] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const decoded = jwtDecode(token);
            setUsuarioNome(decoded.usuarioNome || 'Usuário');
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            navigate('/login');
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    zIndex: theme.zIndex.drawer + 1
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img src={logo} alt="CPA Logo" style={{ height: 40, width: 'auto' }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {usuarioNome}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Portal do Aluno
                                </Typography>
                            </Box>

                            <Tooltip title="Sair">
                                <IconButton
                                    onClick={handleLogout}
                                    sx={{
                                        color: 'error.main',
                                        bgcolor: alpha(theme.palette.error.main, 0.05),
                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                    }}
                                >
                                    <IoExitOutline size={20} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #14461a 100%)`,
                    py: { xs: 4, md: 6 },
                    color: 'white',
                    mb: 4
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Bem-vindo, {usuarioNome.split(' ')[0]}!
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                        Sua voz é fundamental para a melhoria da nossa instituição.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ flex: 1, pb: 6 }}>
                {/* Section Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            p: 1,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex'
                        }}>
                            <IoNotificationsOutline size={24} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Avaliações Disponíveis
                        </Typography>
                    </Box>

                    {!isLoading && avaliacoes.length > 0 && (
                        <Chip
                            label={`${avaliacoes.length} ${avaliacoes.length === 1 ? 'pendente' : 'pendentes'}`}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: '8px' }}
                        />
                    )}
                </Box>

                {/* Content Grid */}
                <Grid container spacing={3}>
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Skeleton variant="rounded" height={200} sx={{ borderRadius: '16px' }} />
                            </Grid>
                        ))
                    ) : avaliacoes.length > 0 ? (
                        avaliacoes.map((avaliacao) => (
                            <Grid item xs={12} sm={6} md={4} key={avaliacao.id}>
                                <Card
                                    sx={{
                                        borderRadius: '16px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => navigate(`/alunos/avaliacao/${avaliacao.id}`)}
                                        sx={{ p: 1 }}
                                    >
                                        <CardContent sx={{ pb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 1.5 }}>
                                                <IoCalendarOutline size={18} />
                                                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                                    {avaliacao.periodo_letivo}
                                                </Typography>
                                            </Box>

                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, minHeight: '3.6em', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {avaliacao.titulo}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main', mt: 0.5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                    Finaliza em: {new Date(avaliacao.data_fim).toLocaleDateString('pt-BR')}
                                                </Typography>
                                            </Box>

                                            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                    <IoCheckmarkCircleOutline size={16} />
                                                    <Typography variant="caption">100% Anônimo</Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        borderRadius: '8px',
                                                        px: 2,
                                                        py: 0.5,
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Responder <IoPlayOutline />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 8,
                                    textAlign: 'center',
                                    borderRadius: '24px',
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    bgcolor: 'transparent'
                                }}
                            >
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', color: 'text.disabled' }}>
                                    <IoNotificationsOutline size={64} />
                                </Box>
                                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                                    Tudo em dia por aqui!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Nenhuma avaliação disponível para você no momento.
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white',
                    mt: 'auto'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            © 2024 CPA UEA - Comissão Própria de Avaliação
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Button size="small" sx={{ textTransform: 'none', color: 'text.secondary' }}>Sobre</Button>
                            <Button size="small" sx={{ textTransform: 'none', color: 'text.secondary' }}>Ajuda</Button>
                            <Button size="small" sx={{ textTransform: 'none', color: 'text.secondary' }}>Contato</Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Alunos;