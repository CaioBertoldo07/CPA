import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Skeleton,
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
import { IoDocumentTextOutline, IoCheckmarkDoneOutline, IoAlertCircleOutline } from 'react-icons/io5';

import { useGetAvaliacoesDisponiveisQuery, useGetVerificarRespostaQuery } from '../../hooks/queries/useAvaliacaoQueries';
import LayoutAluno from '../../components/aluno/LayoutAluno';
import CardAvaliacao from '../../components/aluno/CardAvaliacao';
import BadgeStatus from '../../components/aluno/BadgeStatus';

const AvaliacaoVerificada = ({ avaliacao, onClassify }) => {
    const { data, isSuccess } = useGetVerificarRespostaQuery(avaliacao.id);
    useEffect(() => {
        if (isSuccess) onClassify(avaliacao.id, !!data?.respondeu);
    }, [isSuccess, data, avaliacao.id, onClassify]);
    return null;
};

const AlunoAvaliacoes = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const { data: avaliacoes = [], isLoading } = useGetAvaliacoesDisponiveisQuery();
    const [respostasMap, setRespostasMap] = useState({});

    const handleClassify = useCallback((id, respondeu) => {
        setRespostasMap(prev => ({ ...prev, [id]: respondeu }));
    }, []);

    const disponiveis = avaliacoes.filter(a => !respostasMap[a.id]);
    const respondidas = avaliacoes.filter(a => respostasMap[a.id] === true);

    return (
        <LayoutAluno>
            {avaliacoes.map(a => (
                <AvaliacaoVerificada key={a.id} avaliacao={a} onClassify={handleClassify} />
            ))}

            {/* ── Informativo ── */}
            {!isLoading && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2.5,
                        mb: 3,
                        borderRadius: '12px',
                        bgcolor: disponiveis.length > 0
                            ? alpha(theme.palette.primary.main, 0.06)
                            : alpha(theme.palette.success.main, 0.06),
                        border: '1px solid',
                        borderColor: disponiveis.length > 0
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.success.main, 0.2),
                    }}
                >
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: 44,
                            height: 44,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: disponiveis.length > 0
                                ? alpha(theme.palette.primary.main, 0.12)
                                : alpha(theme.palette.success.main, 0.12),
                            color: disponiveis.length > 0 ? 'primary.main' : 'success.main',
                        }}
                    >
                        {disponiveis.length > 0
                            ? <IoAlertCircleOutline size={20} />
                            : <IoCheckmarkDoneOutline size={20} />
                        }
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                            {disponiveis.length > 0
                                ? `${disponiveis.length} ${disponiveis.length === 1 ? 'avaliação disponível' : 'avaliações disponíveis'} para responder`
                                : 'Nenhuma avaliação pendente'
                            }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {disponiveis.length > 0
                                ? 'Responda antes do prazo. Suas respostas são 100% anônimas.'
                                : 'Você está em dia com todas as suas avaliações.'
                            }
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* ── Disponíveis ── */}
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
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Minhas Avaliações</Typography>
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
                                <IoCheckmarkDoneOutline size={48} color={theme.palette.success.main} style={{ marginBottom: 12 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tudo em dia!</Typography>
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
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{avaliacao.titulo}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">{avaliacao.periodo_letivo}</Typography>
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

export default AlunoAvaliacoes;
