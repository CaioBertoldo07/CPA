import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Skeleton,
    useTheme,
    alpha,
} from '@mui/material';
import { IoTimeOutline, IoCheckmarkDoneOutline } from 'react-icons/io5';

import { useGetAvaliacoesDisponiveisQuery, useGetVerificarRespostaQuery } from '../../hooks/queries/useAvaliacaoQueries';
import LayoutAluno from '../../components/aluno/LayoutAluno';
import BadgeStatus from '../../components/aluno/BadgeStatus';

const AvaliacaoVerificada = ({ avaliacao, onClassify }) => {
    const { data, isSuccess } = useGetVerificarRespostaQuery(avaliacao.id);
    useEffect(() => {
        if (isSuccess) onClassify(avaliacao.id, !!data?.respondeu);
    }, [isSuccess, data, avaliacao.id, onClassify]);
    return null;
};

const AlunoHistorico = () => {
    const theme = useTheme();

    const { data: avaliacoes = [], isLoading } = useGetAvaliacoesDisponiveisQuery();
    const [respostasMap, setRespostasMap] = useState({});

    const handleClassify = useCallback((id, respondeu) => {
        setRespostasMap(prev => ({ ...prev, [id]: respondeu }));
    }, []);

    const respondidas = avaliacoes.filter(a => respostasMap[a.id] === true);
    const allVerified = !isLoading && avaliacoes.length > 0 &&
        avaliacoes.every(a => respostasMap[a.id] !== undefined);

    return (
        <LayoutAluno>
            {avaliacoes.map(a => (
                <AvaliacaoVerificada key={a.id} avaliacao={a} onClassify={handleClassify} />
            ))}

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        p: 0.75, borderRadius: '8px',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main', display: 'flex',
                    }}>
                        <IoTimeOutline size={18} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Histórico de Avaliações</Typography>
                </Box>

                {!isLoading && allVerified && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {respondidas.length}{' '}
                        {respondidas.length === 1 ? 'avaliação respondida' : 'avaliações respondidas'}
                    </Typography>
                )}
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
                                    align={i >= 1 ? 'center' : 'left'}
                                    sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#718096', letterSpacing: '0.4px' }}
                                >
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading || !allVerified ? (
                            [1, 2, 3].map(i => (
                                <TableRow key={i}>
                                    {[1, 2, 3].map(j => (
                                        <TableCell key={j}>
                                            <Skeleton variant="text" width="80%" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : respondidas.length > 0 ? (
                            respondidas.map(avaliacao => (
                                <TableRow key={avaliacao.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {avaliacao.titulo}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="caption" color="text.secondary">
                                            {avaliacao.periodo_letivo}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <BadgeStatus status="respondida" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                                    <IoCheckmarkDoneOutline
                                        size={36}
                                        color={theme.palette.text.disabled}
                                        style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }}
                                    />
                                    <Typography variant="body2" color="text.disabled">
                                        Nenhuma avaliação respondida ainda.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </LayoutAluno>
    );
};

export default AlunoHistorico;
