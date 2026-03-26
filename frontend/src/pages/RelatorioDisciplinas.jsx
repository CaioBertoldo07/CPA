import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useGetAvaliacaoByIdQuery } from '../hooks/queries/useAvaliacaoQueries';
import { useGetRespostasPorDisciplinaQuery } from '../hooks/queries/useRespostaQueries';
import {
    Box, Typography, Paper, Grid, Card, CardContent,
    Select, MenuItem, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Chip, IconButton, Alert, Skeleton, Breadcrumbs, Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';
import FilterListIcon from '@mui/icons-material/FilterList';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import QuizIcon from '@mui/icons-material/Quiz';

const BAR_COLORS = ['#2e7d32', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const RelatorioDisciplinas = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Filtros
    const [selectedUnidade, setSelectedUnidade] = useState('');
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedQuestionId, setSelectedQuestionId] = useState('overall'); // 'overall' ou ID da questão
    
    // Queries
    const { data: avaliacao, isLoading: loadingAvaliacao } = useGetAvaliacaoByIdQuery(id);
    const { 
        data: rankingData, 
        isLoading: loadingRanking, 
        refetch 
    } = useGetRespostasPorDisciplinaQuery(id, {
        unidade: selectedUnidade,
        curso: selectedCurso
    });

    // Lista de questões únicas para o seletor
    const questoesLista = useMemo(() => {
        if (!rankingData || rankingData.length === 0) return [];
        // Pega as questões da primeira disciplina (todas devem ter as mesmas questões)
        return rankingData[0].questoes || [];
    }, [rankingData]);

    // Ranking processado com base no seletor (Geral ou por Questão)
    const processedRanking = useMemo(() => {
        if (!rankingData) return [];
        
        let list = [];
        if (selectedQuestionId === 'overall') {
            list = rankingData.map(d => ({
                name: d.disciplina,
                score: d.scoreGeral,
                total: d.totalRespostas
            }));
        } else {
            list = rankingData.map(d => {
                const q = d.questoes.find(q => q.id_avaliacao_questoes === Number(selectedQuestionId));
                return {
                    name: d.disciplina,
                    score: q ? q.score : 0,
                    total: q ? q.total : 0
                };
            }).filter(item => item.total > 0);
        }

        return list.sort((a, b) => b.score - a.score);
    }, [rankingData, selectedQuestionId]);

    const topItems = processedRanking.slice(0, 10);
    const bottomItems = [...processedRanking].reverse().slice(0, 10).reverse();

    // Handlers
    const handleBack = () => navigate(`/relatorio/${id}`);

    if (loadingAvaliacao || loadingRanking) {
        return (
            <Box sx={{ p: 4 }}>
                <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={200} sx={{ mb: 4, borderRadius: 2 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} /></Grid>
                    <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} /></Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', margin: '0 auto' }}>
            
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link underline="hover" color="inherit" onClick={() => navigate('/relatorios')} sx={{ cursor: 'pointer' }}>
                    Dashboard Geral
                </Link>
                <Link underline="hover" color="inherit" onClick={handleBack} sx={{ cursor: 'pointer' }}>
                    Avaliação #{id}
                </Link>
                <Typography color="text.primary">Ranking por Disciplina</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                        Ranking de Avaliação por Disciplina
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Compare o desempenho das disciplinas nesta avaliação. A pontuação é calculada com base no peso das alternativas selecionadas.
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleBack}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Voltar ao Dashboard
                </Button>
            </Box>

            {/* Filtros e Controles */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Unidade</InputLabel>
                            <Select
                                value={selectedUnidade}
                                label="Unidade"
                                onChange={(e) => setSelectedUnidade(e.target.value)}
                            >
                                <MenuItem value="">Todas as Unidades</MenuItem>
                                {avaliacao?.unidade?.map(u => (
                                    <MenuItem key={u.id} value={u.sigla || u.nome}>{u.sigla || u.nome}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Curso</InputLabel>
                            <Select
                                value={selectedCurso}
                                label="Curso"
                                onChange={(e) => setSelectedCurso(e.target.value)}
                            >
                                <MenuItem value="">Todos os Cursos</MenuItem>
                                {avaliacao?.cursos?.map(c => (
                                    <MenuItem key={c.id} value={c.nome}>{c.nome}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><QuizIcon sx={{ fontSize: 18 }} /> Filtrar por Pergunta</Box></InputLabel>
                            <Select
                                value={selectedQuestionId}
                                label="Filtrar por Pergunta"
                                onChange={(e) => setSelectedQuestionId(e.target.value)}
                            >
                                <MenuItem value="overall">PONTUAÇÃO GERAL (MÉDIA)</MenuItem>
                                {questoesLista.map(q => (
                                    <MenuItem key={q.id_avaliacao_questoes} value={q.id_avaliacao_questoes}>
                                        {q.descricao.length > 80 ? q.descricao.substring(0, 80) + '...' : q.descricao}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                        <IconButton onClick={() => refetch()} color="primary" sx={{ border: '1px solid #e2e8f0' }}>
                            <ReplayIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </Paper>

            {processedRanking.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                    Nenhuma resposta encontrada para os filtros selecionados.
                </Alert>
            ) : (
                <>
                    {/* Gráficos de Top/Bottom */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} lg={6}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Top 10 Disciplinas</Typography>
                                    </Box>
                                    <Box sx={{ height: 350 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topItems} layout="vertical" margin={{ left: 20, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                                <XAxis type="number" domain={[0, 100]} hide />
                                                <YAxis 
                                                    type="category" 
                                                    dataKey="name" 
                                                    width={150} 
                                                    tick={{ fontSize: 11, fill: '#4b5563' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip 
                                                    cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    formatter={(v) => [`${v}%`, 'Pontuação']}
                                                />
                                                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                                    {topItems.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <TrendingDownIcon sx={{ color: '#ef4444' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Disciplinas com Menor Pontuação</Typography>
                                    </Box>
                                    <Box sx={{ height: 350 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={bottomItems} layout="vertical" margin={{ left: 20, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                                <XAxis type="number" domain={[0, 100]} hide />
                                                <YAxis 
                                                    type="category" 
                                                    dataKey="name" 
                                                    width={150} 
                                                    tick={{ fontSize: 11, fill: '#4b5563' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip 
                                                    cursor={{ fill: 'rgba(239,68,68,0.05)' }}
                                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    formatter={(v) => [`${v}%`, 'Pontuação']}
                                                />
                                                <Bar dataKey="score" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tabela Completa */}
                    <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', mb: 6 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Tabela Completa de Ranking</Typography>
                            <Chip label={`${processedRanking.length} disciplinas total`} size="small" />
                        </Box>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Posição</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Disciplina</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Respostas</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Pontuação (%)</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Performance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedRanking.map((row, index) => (
                                    <TableRow key={row.name} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>
                                            <Box sx={{ 
                                                width: 30, height: 30, borderRadius: '50%', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                bgcolor: index < 3 ? '#e8f5e9' : '#f1f5f9',
                                                color: index < 3 ? '#2e7d32' : '#64748b',
                                                fontWeight: 800, fontSize: 12
                                            }}>
                                                {index + 1}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{row.name}</TableCell>
                                        <TableCell align="center">{row.total}</TableCell>
                                        <TableCell align="center">
                                            <Typography sx={{ fontWeight: 700, color: row.score >= 70 ? '#2e7d32' : (row.score >= 50 ? '#f59e0b' : '#ef4444') }}>
                                                {row.score.toFixed(1)}%
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ width: '100%', maxWidth: '200px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary">Aproveitamento</Typography>
                                                </Box>
                                                <Box sx={{ height: 6, width: '100%', bgcolor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                                                    <Box sx={{ 
                                                        height: '100%', 
                                                        width: `${row.score}%`, 
                                                        bgcolor: row.score >= 70 ? '#2e7d32' : (row.score >= 50 ? '#f59e0b' : '#ef4444'),
                                                        borderRadius: 9999
                                                    }} />
                                                </Box>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Liderança por Pergunta */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <QuizIcon /> Detalhamento por Pergunta
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Veja o ranking de disciplinas para cada pergunta individual da avaliação.
                        </Typography>

                        <Grid container spacing={4}>
                            {questoesLista.map((q, qIndex) => {
                                // Criar ranking específico para esta questão
                                const rankingQuestao = rankingData
                                    .map(d => {
                                        const r = d.questoes.find(rq => rq.id_avaliacao_questoes === q.id_avaliacao_questoes);
                                        return {
                                            disciplina: d.disciplina,
                                            total: r?.total || 0,
                                            score: r?.score || 0,
                                            respostas: r?.respostas || {},
                                            alternativasLabel: r?.alternativas || []
                                        };
                                    })
                                    .filter(d => d.total > 0)
                                    .sort((a, b) => b.score - a.score);

                                // Usar as alternativas na ordem correta vinda do backend
                                const alternativas = rankingQuestao[0]?.alternativasLabel || [];

                                return (
                                    <Grid item xs={12} key={q.id_avaliacao_questoes}>
                                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                   {qIndex + 1}. {q.descricao}
                                                </Typography>
                                            </Box>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 700, width: 60 }}>Rank</TableCell>
                                                            <TableCell sx={{ fontWeight: 700 }}>Disciplina</TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Pontuação</TableCell>
                                                            {alternativas.map(alt => (
                                                                <TableCell key={alt} align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                                                                    {alt}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {rankingQuestao.slice(0, 5).map((row, idx) => (
                                                            <TableRow key={row.disciplina}>
                                                                <TableCell>
                                                                    <Chip 
                                                                        label={idx + 1} 
                                                                        size="small" 
                                                                        sx={{ fontWeight: 800, bgcolor: idx === 0 ? '#fef3c7' : '#f1f5f9', color: idx === 0 ? '#92400e' : '#64748b' }} 
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.disciplina}</TableCell>
                                                                <TableCell align="center">
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                                                        {row.score.toFixed(1)}%
                                                                    </Typography>
                                                                </TableCell>
                                                                {alternativas.map(alt => {
                                                                    const count = row.respostas[alt] || 0;
                                                                    const pct = row.total > 0 ? (count / row.total * 100).toFixed(0) : 0;
                                                                    return (
                                                                        <TableCell key={alt} align="center">
                                                                            <Box>
                                                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{count}</Typography>
                                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '10px' }}>{pct}%</Typography>
                                                                            </Box>
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                            </TableRow>
                                                        ))}
                                                        {rankingQuestao.length > 5 && (
                                                            <TableRow>
                                                                <TableCell colSpan={alternativas.length + 3} align="center" sx={{ py: 1, bgcolor: '#f8fafc' }}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        + {rankingQuestao.length - 5} disciplinas ocultas
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default RelatorioDisciplinas;
