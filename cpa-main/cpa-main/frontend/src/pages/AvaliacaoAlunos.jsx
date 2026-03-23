import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    AppBar,
    Toolbar,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    alpha,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Grid
} from '@mui/material';
import {
    IoChevronDownOutline,
    IoArrowBackOutline,
    IoCheckmarkCircleOutline,
    IoInformationCircleOutline
} from 'react-icons/io5';
import { useNotification } from '../context/NotificationContext';
import logo from '../assets/imgs/cpa_logo.svg';
import simIcon from '../assets/imgs/yes_emoji.svg';
import naoIcon from '../assets/imgs/no_emoji.svg';
import naoSeiIcon from '../assets/imgs/idono_emoji.svg';

import {
    useGetAvaliacaoByIdQuery,
    useGetVerificarRespostaQuery
} from '../hooks/queries/useAvaliacaoQueries';
import { useAdicionarRespostaMutation } from '../hooks/mutations/useRespostaMutations';
import { getToken } from '../api/tokenStore';

const AvaliacaoAlunos = () => {
    const { id: avaliacaoId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const showNotification = useNotification();
    const token = getToken();

    const {
        data: avaliacao,
        isLoading: isLoadingAvaliacao,
        isError: isErrorAvaliacao
    } = useGetAvaliacaoByIdQuery(avaliacaoId);

    const {
        data: jaRespondeu,
        isLoading: isLoadingVerificacao
    } = useGetVerificarRespostaQuery(avaliacaoId);

    const adicionarRespostaMutation = useAdicionarRespostaMutation();

    const [respostas, setRespostas] = useState({});
    const [expandedEixo, setExpandedEixo] = useState(null);
    const [progresso, setProgresso] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (jaRespondeu?.respondeu) {
            showNotification('Você já respondeu esta avaliação', 'warning');
            setTimeout(() => navigate('/alunos'), 3000);
        }

        if (isErrorAvaliacao) {
            showNotification('Erro ao carregar avaliação', 'error');
            navigate('/alunos');
        }
    }, [avaliacaoId, token, navigate, jaRespondeu, isErrorAvaliacao, showNotification]);

    useEffect(() => {
        let total = 0;
        let respondidas = 0;

        avaliacao?.avaliacao_questoes?.forEach((aq) => {
            const questao = aq.questoes;
            const sub = questao?.questoesAdicionais || questao?.questoes_adicionais || [];

            if (sub.length > 0) {
                total += sub.length;
                sub.forEach(s => {
                    if (respostas[`${questao.id}-${s.id}`]) respondidas++;
                });
            } else {
                total += 1;
                if (respostas[questao.id]) respondidas++;
            }
        });

        setProgresso(total > 0 ? Math.round((respondidas / total) * 100) : 0);
    }, [respostas, avaliacao]);

    useEffect(() => {
        if (avaliacao?.avaliacao_questoes?.length > 0 && !expandedEixo) {
            const firstQuestao = avaliacao.avaliacao_questoes[0].questoes;
            const firstEixoKey = `${firstQuestao.dimensoes.eixos.numero} - ${firstQuestao.dimensoes.eixos.nome}`;
            setExpandedEixo(firstEixoKey);
        }
    }, [avaliacao, expandedEixo]);

    const groupByEixoDimensao = () => {
        return avaliacao?.avaliacao_questoes?.reduce((acc, { id: avQuestId, questoes }) => {
            const eixoKey = `${questoes.dimensoes.eixos.numero} - ${questoes.dimensoes.eixos.nome}`;
            const dimensaoKey = `${questoes.dimensoes.numero} - ${questoes.dimensoes.nome}`;

            if (!acc[eixoKey]) {
                acc[eixoKey] = {
                    nome: questoes.dimensoes.eixos.nome,
                    numero: questoes.dimensoes.eixos.numero,
                    dimensoes: {}
                };
            }

            if (!acc[eixoKey].dimensoes[dimensaoKey]) {
                acc[eixoKey].dimensoes[dimensaoKey] = {
                    nome: questoes.dimensoes.nome,
                    numero: questoes.dimensoes.numero,
                    questoes: []
                };
            }

            acc[eixoKey].dimensoes[dimensaoKey].questoes.push({ ...questoes, avQuestId });
            return acc;
        }, {}) || {};
    };

    const handleResposta = (questaoId, alternativaId, adicionalId = null) => {
        const key = adicionalId ? `${questaoId}-${adicionalId}` : questaoId;
        setRespostas(prev => ({ ...prev, [key]: alternativaId }));
    };

    const renderChoice = (alt, inputName, inputKey, questaoId, subquestaoId) => {
        const isSelected = respostas[inputKey] === alt.id;
        let icon = null;
        if (alt.descricao === 'Sim') icon = simIcon;
        else if (alt.descricao === 'Não') icon = naoIcon;
        else if (alt.descricao === 'Não sei responder') icon = naoSeiIcon;

        return (
            <Grid item xs={12} sm={4} key={alt.id}>
                <Card
                    elevation={0}
                    sx={{
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        borderRadius: '12px',
                        transition: 'all 0.2s',
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                        '&:hover': {
                            borderColor: isSelected ? 'primary.main' : alpha(theme.palette.primary.main, 0.4),
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.02),
                        }
                    }}
                >
                    <CardActionArea
                        onClick={() => handleResposta(questaoId, alt.id, subquestaoId)}
                        sx={{ p: 2 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {icon && <img src={icon} alt={alt.descricao} style={{ width: 24, height: 24 }} />}
                            <Typography variant="body2" sx={{ fontWeight: 600, color: isSelected ? 'primary.main' : 'text.primary' }}>
                                {alt.descricao}
                            </Typography>
                            {isSelected && (
                                <Box sx={{ ml: 'auto', color: 'primary.main', display: 'flex' }}>
                                    <IoCheckmarkCircleOutline size={20} />
                                </Box>
                            )}
                        </Box>
                    </CardActionArea>
                </Card>
            </Grid>
        );
    };

    const renderQuestoes = (questao) => {
        const subquestoes = questao.questoesAdicionais || questao.questoes_adicionais || [];

        if (subquestoes.length > 0) {
            return (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                        {questao.descricao}
                    </Typography>
                    {subquestoes.map((sub) => (
                        <Paper
                            key={sub.id}
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 2,
                                bgcolor: '#f8fafc',
                                borderRadius: '16px',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                                {sub.descricao}
                            </Typography>
                            <Grid container spacing={2}>
                                {questao.padrao_resposta.alternativas.map((alt) =>
                                    renderChoice(alt, `q-${questao.id}-${sub.id}`, `${questao.id}-${sub.id}`, questao.id, sub.id)
                                )}
                            </Grid>
                        </Paper>
                    ))}
                </Box>
            );
        }

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                    {questao.descricao}
                </Typography>
                <Grid container spacing={2}>
                    {questao.padrao_resposta.alternativas.map((alt) =>
                        renderChoice(alt, `q-${questao.id}`, questao.id, questao.id, null)
                    )}
                </Grid>
            </Paper>
        );
    };

    const handleSubmit = async () => {
        const respostasFormatadas = avaliacao.avaliacao_questoes.flatMap((avaliacaoQuestao) => {
            const questao = avaliacaoQuestao.questoes;
            const subquestoes = questao.questoesAdicionais || questao.questoes_adicionais || [];

            if (subquestoes.length > 0) {
                return subquestoes.map((sub) => {
                    const key = `${questao.id}-${sub.id}`;
                    return {
                        id_avaliacao_questoes: avaliacaoQuestao.id,
                        adicionalId: sub.id,
                        id_alternativa: parseInt(respostas[key], 10)
                    };
                });
            }

            return [{
                id_avaliacao_questoes: avaliacaoQuestao.id,
                id_alternativa: parseInt(respostas[questao.id], 10)
            }];
        });

        if (respostasFormatadas.some(resp => !resp.id_alternativa || isNaN(resp.id_alternativa))) {
            showNotification('Por favor, responda todas as questões antes de enviar!', 'warning');
            setShowConfirm(false);
            return;
        }

        const payload = {
            idAvaliacao: parseInt(avaliacaoId),
            respostas: respostasFormatadas
        };

        adicionarRespostaMutation.mutate(payload, {
            onSuccess: () => {
                showNotification('Avaliação enviada com sucesso! Obrigado por participar.', 'success');
                setTimeout(() => navigate('/alunos'), 2000);
            },
            onError: (error) => {
                showNotification(error.message || 'Erro ao enviar avaliação', 'error');
                setShowConfirm(false);
            }
        });
    };

    if (isLoadingAvaliacao || isLoadingVerificacao) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
                <LinearProgress sx={{ width: '200px', borderRadius: 2 }} />
                <Typography variant="body2" color="text.secondary">Carregando avaliação...</Typography>
            </Box>
        );
    }

    if (jaRespondeu?.respondeu) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, textAlign: 'center', p: 3 }}>
                <IoCheckmarkCircleOutline size={64} color={theme.palette.success.main} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Você já respondeu esta avaliação!</Typography>
                <Typography color="text.secondary">Redirecionando para o painel...</Typography>
                <Button variant="outlined" onClick={() => navigate('/alunos')} sx={{ mt: 2 }}>Voltar Agora</Button>
            </Box>
        );
    }

    if (isErrorAvaliacao || !avaliacao) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, textAlign: 'center', p: 3 }}>
                <IoInformationCircleOutline size={64} color={theme.palette.error.main} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Erro ao carregar avaliação</Typography>
                <Typography color="text.secondary">Não foi possível encontrar os dados desta avaliação.</Typography>
                <Button variant="contained" onClick={() => navigate('/alunos')} sx={{ mt: 2 }}>Voltar para Avaliações</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
                <Toolbar sx={{ display: 'flex', flexDirection: 'column', py: 1 }}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <IconButton onClick={() => navigate('/alunos')} size="small">
                            <IoArrowBackOutline size={20} />
                        </IconButton>
                        <img src={logo} alt="CPA Logo" style={{ height: 32 }} />
                        <Box sx={{ minWidth: 40 }} />
                    </Box>
                    <Box sx={{ width: '100%', px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                PROGRESSO
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {progresso}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progresso}
                            sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                        {avaliacao?.titulo}
                    </Typography>
                    <Chip
                        label={avaliacao?.periodo_letivo}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: '6px' }}
                    />
                </Box>

                <Box sx={{ mb: 4 }}>
                    {Object.entries(groupByEixoDimensao()).map(([eixoKey, eixoData]) => (
                        <Accordion
                            key={eixoKey}
                            expanded={expandedEixo === eixoKey}
                            onChange={() => setExpandedEixo(expandedEixo === eixoKey ? null : eixoKey)}
                            sx={{
                                mb: 2,
                                borderRadius: '16px !important',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 'none',
                                '&:before': { display: 'none' },
                                overflow: 'hidden'
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<IoChevronDownOutline />}
                                sx={{
                                    bgcolor: expandedEixo === eixoKey ? alpha(theme.palette.primary.main, 0.03) : 'white',
                                    '& .MuiAccordionSummary-content': { alignItems: 'center' }
                                }}
                            >
                                <Box sx={{
                                    p: 1,
                                    mr: 2,
                                    borderRadius: '8px',
                                    bgcolor: expandedEixo === eixoKey ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                                    color: expandedEixo === eixoKey ? 'white' : 'primary.main',
                                    display: 'flex',
                                    fontWeight: 700,
                                    width: 32,
                                    height: 32,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {eixoData.numero}
                                </Box>
                                <Typography sx={{ fontWeight: 700, variant: 'subtitle1' }}>
                                    {eixoData.nome}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: { xs: 1, sm: 3 }, py: 3, bgcolor: 'white' }}>
                                {Object.entries(eixoData.dimensoes).map(([dimensaoKey, dimData]) => (
                                    <Box key={dimensaoKey} sx={{ mb: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                                DIMENSÃO {dimData.numero}:
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                                {dimData.nome}
                                            </Typography>
                                        </Box>

                                        {dimData.questoes.map((questao) => (
                                            <Box key={questao.id}>
                                                {renderQuestoes(questao)}
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => setShowConfirm(true)}
                        disabled={adicionarRespostaMutation.isPending || progresso < 100}
                        sx={{
                            px: 8,
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        {adicionarRespostaMutation.isPending ? 'Enviando...' : 'Finalizar Avaliação'}
                    </Button>
                    {progresso < 100 && (
                        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                            * Por favor, responda todas as questões para habilitar o envio.
                        </Typography>
                    )}
                </Box>
            </Container>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
                    Confirmar Envio?
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Box sx={{ color: 'primary.main', mb: 2 }}>
                            <IoInformationCircleOutline size={64} />
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            Uma vez enviada, você não poderá alterar suas respostas. Deseja confirmar o envio desta avaliação?
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
                    <Button
                        onClick={() => setShowConfirm(false)}
                        variant="outlined"
                        sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
                    >
                        Revisar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
                    >
                        Confirmar e Enviar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AvaliacaoAlunos;