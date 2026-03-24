import React, { useState, useEffect, useMemo } from 'react';
import {
    IconButton,
    Tooltip,
    TextField,
    Button,
    MenuItem,
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    Chip,
    CircularProgress,
    Grid
} from '@mui/material';
import { FaRegEdit } from 'react-icons/fa';
import MuiBaseModal from '../utils/MuiBaseModal';
import Modal_Questoes from './Modal_Questoes';
import { getQuestaoById } from '../../api/questoes';
import { useGetQuestoesQuery } from '../../hooks/queries/useQuestaoQueries';

function QuestaoSelectionModal({ show, onHide, onQuestoesSelected, initialSelectedIds = [] }) {
    const [dimensaoSelecionada, setDimensaoSelecionada] = React.useState('');
    const [questoesSelecionadas, setQuestoesSelecionadas] = React.useState([]);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [selectedQuestion, setSelectedQuestion] = React.useState(null);

    // Initialize selection from props when modal opens
    React.useEffect(() => {
        if (show) {
            setQuestoesSelecionadas(initialSelectedIds);
        }
    }, [show, initialSelectedIds]);

    const {
        data: questoes = [],
        isLoading: loading,
        isError,
        error: queryError
    } = useGetQuestoesQuery();

    const dimensoes = React.useMemo(() => Array.from(new Set(questoes
        .map(q => q?.dimensao?.nome)
        .filter(Boolean)
    )).sort(), [questoes]);

    React.useEffect(() => {
        if (isError) {
            console.error("Erro ao carregar questões:", queryError);
        }
    }, [isError, queryError]);

    // Reset when closing
    const handleClose = () => {
        setDimensaoSelecionada('');
        setQuestoesSelecionadas([]);
        onHide();
    };

    const filteredQuestoes = React.useMemo(() => dimensaoSelecionada
        ? questoes.filter(q => q?.dimensao?.nome === dimensaoSelecionada)
        : questoes, [questoes, dimensaoSelecionada]);

    const handleQuestaoToggle = (questaoId) => {
        setQuestoesSelecionadas(prev =>
            prev.includes(questaoId)
                ? prev.filter(id => id !== questaoId)
                : [...prev, questaoId]
        );
    };

    const handleSelectAll = (event) => {
        const checked = event.target.checked;
        const allFilteredIds = filteredQuestoes.map(q => q.id);

        if (!checked) {
            setQuestoesSelecionadas(prev => prev.filter(id => !allFilteredIds.includes(id)));
        } else {
            setQuestoesSelecionadas(prev => {
                const newSet = new Set([...prev, ...allFilteredIds]);
                return Array.from(newSet);
            });
        }
    };

    const handleConfirmSelection = () => {
        onQuestoesSelected(questoesSelecionadas);
        handleClose();
    };
    
    const handleEditClick = async (questao) => {
        try {
            const data = await getQuestaoById(questao.id);
            setSelectedQuestion(data);
            setShowEditModal(true);
        } catch (error) {
            console.error("Erro ao buscar detalhes da questão:", error);
        }
    };

    const handleEditSuccess = (updatedQuestao) => {
        // Se a questão foi clonada (novo ID), atualiza a seleção local
        if (updatedQuestao && selectedQuestion && updatedQuestao.id !== selectedQuestion.id) {
            setQuestoesSelecionadas(prev => {
                const filtered = prev.filter(id => id !== selectedQuestion.id);
                return [...filtered, updatedQuestao.id];
            });
        }
        setShowEditModal(false);
        setSelectedQuestion(null);
    };

    const groupedQuestoes = React.useMemo(() => filteredQuestoes.reduce((acc, questao) => {
        const eixoNome = questao?.dimensao?.eixo?.nome || 'Sem eixo';
        const eixoNumero = questao?.dimensao?.eixo?.numero ?? '';
        const dimensaoNome = questao?.dimensao?.nome || 'Sem dimensão';
        const dimensaoNumero = questao?.dimensao?.numero ?? '';

        const eixoKey = `${eixoNumero} - ${eixoNome}`;
        const dimensaoKey = `${dimensaoNumero} - ${dimensaoNome}`;

        if (!acc[eixoKey]) acc[eixoKey] = {};
        if (!acc[eixoKey][dimensaoKey]) acc[eixoKey][dimensaoKey] = [];

        acc[eixoKey][dimensaoKey].push(questao);
        return acc;
    }, {}), [filteredQuestoes]);

    const allFilteredIds = filteredQuestoes.map(q => q.id);
    const allFilteredSelected = allFilteredIds.length > 0 &&
        allFilteredIds.every(id => questoesSelecionadas.includes(id));
    const isIndeterminate = allFilteredIds.some(id => questoesSelecionadas.includes(id)) && !allFilteredSelected;

    const modalActions = (
        <>
            <Button
                onClick={handleClose}
                color="inherit"
                sx={{ fontWeight: 600 }}
            >
                Cancelar
            </Button>
            <Button
                onClick={handleConfirmSelection}
                variant="contained"
                color="primary"
                disabled={questoesSelecionadas.length === 0}
                sx={{
                    fontWeight: 700,
                    minWidth: '150px'
                }}
            >
                Confirmar ({questoesSelecionadas.length})
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={handleClose}
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    Selecionar Questões
                    {questoesSelecionadas.length > 0 && (
                        <Chip
                            label={`${questoesSelecionadas.length} selecionada(s)`}
                            color="success"
                            size="small"
                            variant="filled"
                        />
                    )}
                </Box>
            }
            actions={modalActions}
            isLoading={loading}
            maxWidth="md"
        >
            <Box sx={{ minHeight: '400px' }}>
                <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Filtrar por Dimensão"
                            value={dimensaoSelecionada}
                            onChange={(e) => setDimensaoSelecionada(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        >
                            <MenuItem value="">Todas as dimensões</MenuItem>
                            {dimensoes.map((d, i) => (
                                <MenuItem key={i} value={d}>{d}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={allFilteredSelected}
                                    indeterminate={isIndeterminate}
                                    onChange={handleSelectAll}
                                    color="primary"
                                />
                            }
                            label={allFilteredSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                            disabled={filteredQuestoes.length === 0}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ maxHeight: '50vh', overflowY: 'auto', pr: 1 }}>
                    {Object.keys(groupedQuestoes).length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">Nenhuma questão encontrada para este filtro.</Typography>
                        </Box>
                    ) : (
                        Object.entries(groupedQuestoes).map(([eixoKey, dimensoesObj]) => {
                            let questaoCount = 1;
                            return (
                                <Box key={eixoKey} sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" color="primary" sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 0.5, mb: 1, fontWeight: 700 }}>
                                        {eixoKey}
                                    </Typography>
                                    {Object.entries(dimensoesObj).map(([dimKey, questoes]) => (
                                        <Box key={dimKey} sx={{ ml: 2, mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                                {dimKey}
                                            </Typography>
                                            <List sx={{ p: 0 }}>
                                                {questoes.map((questao) => {
                                                    const isSelected = questoesSelecionadas.includes(questao.id);
                                                    const subquestoes = questao.questoesAdicionais || [];
                                                    return (
                                                        <ListItem
                                                            key={questao.id}
                                                            disablePadding
                                                            secondaryAction={
                                                                <Tooltip title="Editar Questão">
                                                                    <IconButton 
                                                                        edge="end" 
                                                                        aria-label="edit" 
                                                                        onClick={(e) => { e.stopPropagation(); handleEditClick(questao); }}
                                                                        size="small"
                                                                        sx={{ color: 'primary.main', '&:hover': { color: 'primary.dark' } }}
                                                                    >
                                                                        <FaRegEdit size={16} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            }
                                                            sx={{
                                                                py: 0.5,
                                                                borderRadius: 1,
                                                                '&:hover': { backgroundColor: 'action.hover' }
                                                            }}
                                                        >
                                                            <Box 
                                                                onClick={() => handleQuestaoToggle(questao.id)}
                                                                sx={{ 
                                                                    display: 'flex', 
                                                                    width: '100%', 
                                                                    cursor: 'pointer',
                                                                    alignItems: 'flex-start',
                                                                    pr: 6 // Espaço para o botão de edit
                                                                }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                                                    <Checkbox
                                                                        edge="start"
                                                                        checked={isSelected}
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                        size="small"
                                                                    />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={`Q${questaoCount++} — ${questao.descricao}`}
                                                                    primaryTypographyProps={{
                                                                        variant: 'body2',
                                                                        sx: { fontWeight: isSelected ? 600 : 400 }
                                                                    }}
                                                                    secondary={subquestoes.length > 0 ? (
                                                                        <Box sx={{ mt: 0.5, pl: 1.5, borderLeft: '2px solid #e2e8f0' }}>
                                                                            {subquestoes.map(qa => (
                                                                                <Typography key={qa.id} variant="caption" display="block" sx={{ color: '#64748b' }}>
                                                                                    • {qa.descricao}
                                                                                </Typography>
                                                                            ))}
                                                                        </Box>
                                                                    ) : null}
                                                                    secondaryTypographyProps={{ component: 'div' }}
                                                                />
                                                            </Box>
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Box>
                                    ))}
                                </Box>
                            );
                        })
                    )}
                </Box>
            </Box>
            
            {showEditModal && selectedQuestion && (
                <Modal_Questoes
                    show={showEditModal}
                    onHide={() => { setShowEditModal(false); setSelectedQuestion(null); }}
                    questao={selectedQuestion}
                    onSuccess={handleEditSuccess}
                />
            )}
        </MuiBaseModal>
    );
}

export default QuestaoSelectionModal;