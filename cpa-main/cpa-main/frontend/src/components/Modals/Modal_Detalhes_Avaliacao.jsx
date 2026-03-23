// src/components/Modals/Modal_Detalhes_Avaliacao.jsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab,
    Box,
    Chip,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} role="tabpanel">
        {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
);

const SectionEmpty = ({ label }) => (
    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        Nenhum(a) {label} vinculado(a).
    </Typography>
);

const Modal_Detalhes_Avaliacao = ({ avaliacao, open, onClose }) => {
    const [tab, setTab] = useState(0);

    if (!avaliacao) return null;

    const questoes = avaliacao.questoes || [];
    const cursos = avaliacao.cursos || [];
    const unidades = avaliacao.unidade || [];

    // Derive unique municipalities from courses
    const municipiosMap = new Map();
    cursos.forEach(c => {
        if (c.municipio) {
            municipiosMap.set(c.municipio.id, c.municipio);
        }
    });
    const municipios = Array.from(municipiosMap.values());

    const fmt = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Detalhes da Avaliação{' '}
                        <Typography component="span" variant="subtitle1" fontFamily="monospace" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.3, borderRadius: 1, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                            #{avaliacao.id}
                        </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {avaliacao.periodo_letivo} · {fmt(avaliacao.data_inicio)} – {fmt(avaliacao.data_fim)}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Divider />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                    sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', minHeight: 44 } }}>
                    <Tab icon={<QuizOutlinedIcon fontSize="small" />} iconPosition="start"
                        label={`Questões (${questoes.length})`} />
                    <Tab icon={<SchoolOutlinedIcon fontSize="small" />} iconPosition="start"
                        label={`Cursos (${cursos.length})`} />
                    <Tab icon={<ApartmentOutlinedIcon fontSize="small" />} iconPosition="start"
                        label={`Unidades (${unidades.length})`} />
                    <Tab icon={<LocationOnOutlinedIcon fontSize="small" />} iconPosition="start"
                        label={`Municípios (${municipios.length})`} />
                </Tabs>
            </Box>

            <DialogContent sx={{ minHeight: 260, px: 3 }}>
                {/* Questões */}
                <TabPanel value={tab} index={0}>
                    {questoes.length === 0 ? <SectionEmpty label="questão" /> : (
                        <List dense disablePadding>
                            {questoes.map((q, i) => (
                                <React.Fragment key={q.id || i}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <Typography variant="caption" sx={{
                                                        bgcolor: '#f1f5f9', px: 0.8, py: 0.2, borderRadius: 1,
                                                        border: '1px solid #e2e8f0', fontFamily: 'monospace',
                                                        whiteSpace: 'nowrap', mt: 0.2
                                                    }}>
                                                        #{q.id}
                                                    </Typography>
                                                    <Typography variant="body2">{q.descricao}</Typography>
                                                </Box>
                                            }
                                            secondary={
                                                q.dimensoes ? (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {q.dimensoes.eixos?.nome && `${q.dimensoes.eixos.nome} › `}{q.dimensoes.nome}
                                                    </Typography>
                                                ) : null
                                            }
                                        />
                                    </ListItem>
                                    {i < questoes.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </TabPanel>

                {/* Cursos */}
                <TabPanel value={tab} index={1}>
                    {cursos.length === 0 ? <SectionEmpty label="curso" /> : (
                        <List dense disablePadding>
                            {cursos.map((c, i) => (
                                <React.Fragment key={c.id || i}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={500}>{c.nome}</Typography>}
                                            secondary={
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                    {c.nivel && (
                                                        <Chip label={c.nivel} size="small" variant="outlined"
                                                            sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#f8fafc' }} />
                                                    )}
                                                    {c.municipio && (
                                                        <Chip label={c.municipio.nome} size="small" variant="outlined"
                                                            sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }} />
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {i < cursos.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </TabPanel>

                {/* Unidades */}
                <TabPanel value={tab} index={2}>
                    {unidades.length === 0 ? <SectionEmpty label="unidade" /> : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
                            {unidades.map((u, i) => (
                                <Chip
                                    key={u.id || i}
                                    label={
                                        <Box>
                                            <Typography variant="caption" fontWeight={700}>{u.sigla}</Typography>
                                            <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>{u.nome}</Typography>
                                        </Box>
                                    }
                                    variant="outlined"
                                    sx={{ height: 'auto', py: 0.5, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}
                                />
                            ))}
                        </Box>
                    )}
                </TabPanel>

                {/* Municípios */}
                <TabPanel value={tab} index={3}>
                    {municipios.length === 0 ? <SectionEmpty label="município" /> : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
                            {municipios.map((m, i) => (
                                <Chip
                                    key={m.id || i}
                                    label={`${m.nome} – ${m.UF}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ bgcolor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', fontWeight: 500 }}
                                />
                            ))}
                        </Box>
                    )}
                </TabPanel>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Modal_Detalhes_Avaliacao;
