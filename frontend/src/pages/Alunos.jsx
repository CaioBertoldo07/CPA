import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Skeleton,
    Alert,
    AlertTitle,
    Button,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
    alpha,
} from '@mui/material';
import {
    IoDocumentTextOutline,
    IoAlertCircleOutline,
    IoCheckmarkDoneOutline,
    IoArrowForwardOutline,
} from 'react-icons/io5';

import { useGetAvaliacoesDisponiveisQuery, useGetVerificarRespostaQuery } from '../hooks/queries/useAvaliacaoQueries';

import LayoutAluno from '../components/aluno/LayoutAluno';
import CardAvaliacao from '../components/aluno/CardAvaliacao';
import BadgeStatus from '../components/aluno/BadgeStatus';

/* ── helper: dispara a query de verificação de resposta por avaliação ── */
const AvaliacaoVerificada = ({ avaliacao, onClassify }) => {
    const { data, isSuccess } = useGetVerificarRespostaQuery(avaliacao.id);

    useEffect(() => {
        if (isSuccess) onClassify(avaliacao.id, !!data?.respondeu);
    }, [isSuccess, data, avaliacao.id, onClassify]);

    return null;
};

/* ===================================================================== */

const Alunos = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const { data: avaliacoes = [], isLoading } = useGetAvaliacoesDisponiveisQuery();
    const [respostasMap, setRespostasMap] = useState({});

    const handleClassify = useCallback((id, respondeu) => {
        setRespostasMap(prev => ({ ...prev, [id]: respondeu }));
    }, []);

    const allVerified = !isLoading && avaliacoes.length > 0 &&
        avaliacoes.every(a => respostasMap[a.id] !== undefined);

    const disponiveis = avaliacoes.filter(a => !respostasMap[a.id]);
    const respondidas = avaliacoes.filter(a => respostasMap[a.id] === true);
    const totalRespondidas = respondidas.length;
    const total = avaliacoes.length;
    const progressoPct = total > 0 ? Math.round((totalRespondidas / total) * 100) : 0;

    return (
        <LayoutAluno>
            {/* Hidden verifiers */}
            {avaliacoes.map(a => (
                <AvaliacaoVerificada key={a.id} avaliacao={a} onClassify={handleClassify} />
            ))}

            {/* ── Alert banner ── */}
            {!isLoading && disponiveis.length > 0 && (
                <Alert
                    severity="info"
                    icon={<IoAlertCircleOutline size={22} />}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            endIcon={<IoArrowForwardOutline />}
                            onClick={() => navigate('/alunos/avaliacoes')}
                            sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                            Ver avaliações
                        </Button>
                    }
                    sx={{
                        mb: 3,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.info.main, 0.3),
                        '& .MuiAlert-message': { display: 'flex', alignItems: 'center' },
                    }}
                >
                    <AlertTitle sx={{ mb: 0, fontWeight: 700 }}>
                        Você possui {disponiveis.length}{' '}
                        {disponiveis.length === 1 ? 'avaliação disponível' : 'avaliações disponíveis'} para responder
                    </AlertTitle>
                </Alert>
            )}

            {/* ── Progresso ── */}
            {!isLoading && total > 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'white',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IoCheckmarkDoneOutline size={20} color={theme.palette.primary.main} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Progresso das Avaliações
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {totalRespondidas} de {total} respondidas
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant={allVerified ? 'determinate' : 'indeterminate'}
                        value={progressoPct}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': { borderRadius: 4 },
                        }}
                    />

                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.75, display: 'block' }}>
                        {progressoPct}% concluído
                    </Typography>
                </Paper>
            )}

            {/* ── Avaliações disponíveis ── */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            p: 0.75, borderRadius: '8px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main', display: 'flex',
                        }}>
                            <IoDocumentTextOutline size={18} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Avaliações Disponíveis
                        </Typography>
                    </Box>
                    {!isLoading && disponiveis.length > 0 && (
                        <BadgeStatus status="disponivel" />
                    )}
                </Box>

                <Grid container spacing={2.5}>
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <Grid item xs={12} sm={6} lg={4} key={i}>
                                <Skeleton variant="rounded" height={180} sx={{ borderRadius: '12px' }} />
                            </Grid>
                        ))
                    ) : disponiveis.length > 0 ? (
                        disponiveis.map(avaliacao => (
                            <Grid item xs={12} sm={6} lg={4} key={avaliacao.id}>
                                <CardAvaliacao
                                    avaliacao={avaliacao}
                                    variant="disponivel"
                                    onResponder={() => navigate(`/alunos/avaliacao/${avaliacao.id}`)}
                                />
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 6, textAlign: 'center', borderRadius: '12px',
                                    border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent',
                                }}
                            >
                                <IoCheckmarkDoneOutline
                                    size={48}
                                    color={theme.palette.success.main}
                                    style={{ marginBottom: 12 }}
                                />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Tudo em dia!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Nenhuma avaliação disponível no momento.
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* ── Respondidas ── */}
            {!isLoading && respondidas.length > 0 && (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{
                            p: 0.75, borderRadius: '8px',
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: 'info.main', display: 'flex',
                        }}>
                            <IoCheckmarkDoneOutline size={18} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Respondidas</Typography>
                    </Box>

                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}
                    >
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                    {['Avaliação', 'Período', 'Status'].map((h, i) => (
                                        <TableCell
                                            key={h}
                                            align={i === 2 ? 'center' : 'left'}
                                            sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#718096', letterSpacing: '0.4px' }}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {respondidas.map(avaliacao => (
                                    <TableRow key={avaliacao.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {avaliacao.titulo}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {avaliacao.periodo_letivo}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <BadgeStatus status="respondida" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </LayoutAluno>
    );
};

export default Alunos;
