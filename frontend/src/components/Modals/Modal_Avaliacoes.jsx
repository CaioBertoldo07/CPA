import React, { useState, useEffect, useMemo } from 'react';
import {
    Grid,
    TextField,
    MenuItem,
    Typography,
    Box,
    Button,
    Alert,
    Paper,
    Badge,
    InputAdornment
} from '@mui/material';
import {
    IoCalendarOutline,
    IoAddOutline,
    IoSchoolOutline,
    IoListOutline
} from 'react-icons/io5';
import MuiBaseModal from '../utils/MuiBaseModal';
import { useAdicionarAvaliacaoMutation, useEditAvaliacaoMutation } from '../../hooks/mutations/useAvaliacaoMutations';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useGetMunicipiosQuery } from '../../hooks/queries/useMunicipioQueries';
import { useGetUnidadesByMunicipiosQuery } from '../../hooks/queries/useUnidadeQueries';
import { useGetCategoriasQuery } from '../../hooks/queries/useCategoriaQueries';
import { useGetAvaliacaoByIdQuery } from '../../hooks/queries/useAvaliacaoQueries';
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import CursoSelectionModal from './CursoSelectionModal';
import QuestaoSelectionModal from './QuestaoSelectionModal';

/**
 * Converts a questão ID to a plain integer.
 * Handles virtual IDs produced by repetir_todas_disciplinas expansion:
 *   "5___DISC001 - Cálculo"  →  5
 *   5                        →  5
 *   "5"                      →  5
 */
function normalizeVirtualQuestaoId(id) {
    if (typeof id === 'number') return id;
    const str = String(id);
    const match = str.match(/^(\d+)___/);
    return match ? parseInt(match[1], 10) : parseInt(str, 10);
}

function Modal_Avaliacoes(props) {
    // props.avaliacaoId — when set, modal is in edit mode
    const editMode = !!props.avaliacaoId;

    const [ano, setAno] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [municipiosVinculo, setMunicipiosVinculo] = useState([]);
    const [unidadeSelecionada, setUnidadeSelecionada] = useState([]);
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
    const [modalidadeSelecionada, setModalidadeSelecionada] = useState([]);
    const [curso, setCurso] = useState('');
    const [cursosSelecionados, setCursosSelecionados] = useState([]);
    const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
    const [error, setError] = useState('');
    const [showCursoModal, setShowCursoModal] = useState(false);
    const [showQuestaoModal, setShowQuestaoModal] = useState(false);
    const [editUnidadeIds, setEditUnidadeIds] = useState([]);

    const { data: municipiosData = [] } = useGetMunicipiosQuery();
    const { data: modalidadesData = [] } = useGetModalidadesQuery();
    const { data: categoriasData = [] } = useGetCategoriasQuery();

    const municipiosNomes = municipiosVinculo.map(m => m.label.split(' - ')[0]);
    const { data: unidadesData = [] } = useGetUnidadesByMunicipiosQuery(municipiosNomes);

    const { data: avaliacaoEditData } = useGetAvaliacaoByIdQuery(editMode ? props.avaliacaoId : null);

    const adicionarAvaliacaoMutation = useAdicionarAvaliacaoMutation();
    const editAvaliacaoMutation = useEditAvaliacaoMutation();
    const loading = editMode ? editAvaliacaoMutation.isPending : adicionarAvaliacaoMutation.isPending;

    const municipiosOptions = useMemo(() =>
        municipiosData.map(m => ({ value: m.id, label: `${m.nome} - ${m.UF}` })), [municipiosData]);
    const modalidadesOptions = useMemo(() =>
        modalidadesData.map(m => ({ value: m.id, label: m.mod_ensino })), [modalidadesData]);
    const unidadesOptions = useMemo(() =>
        unidadesData.map(u => ({ value: u.id, label: `${u.nome} - ${u.sigla}` })), [unidadesData]);
    const categoriasOptions = useMemo(() =>
        categoriasData.map(c => ({ value: c.id, label: c.nome })), [categoriasData]);

    const temCategoriaDiscente = useMemo(() => (
        categoriasData.some(
            categoria =>
                categoria?.nome?.toUpperCase() === 'DISCENTE' &&
                categoriasSelecionadas.includes(categoria.id)
        )
    ), [categoriasData, categoriasSelecionadas]);

    // Reset on close
    useEffect(() => {
        if (!props.show) {
            setAno(''); setPeriodo('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate(new Date().toISOString().split('T')[0]);
            setMunicipiosVinculo([]); setUnidadeSelecionada([]);
            setCategoriasSelecionadas([]); setModalidadeSelecionada([]);
            setCurso(''); setCursosSelecionados([]);
            setQuestoesSelecionadas([]); setError('');
            setEditUnidadeIds([]);
        }
    }, [props.show]);

    // Pre-populate form when editing
    useEffect(() => {
        if (!editMode || !avaliacaoEditData || !props.show || !municipiosOptions.length) return;

        const avaliacao = avaliacaoEditData;
        const [anoVal, periodoVal] = (avaliacao.periodo_letivo || '').split('.');
        setAno(anoVal || '');
        setPeriodo(periodoVal || '');
        setStartDate((avaliacao.data_inicio || '').split('T')[0]);
        setEndDate((avaliacao.data_fim || '').split('T')[0]);

        const modals = (avaliacao.modalidades || []).map(m => ({ value: m.id, label: m.mod_ensino }));
        setModalidadeSelecionada(modals);

        const cats = (avaliacao.categorias || []).map(c => (typeof c === 'object' ? c.id : c));
        setCategoriasSelecionadas(cats);

        const cursosApi = avaliacao.cursos || [];
        setCursosSelecionados(cursosApi);
        setCurso(cursosApi.map(c => c.nome).join(', '));

        // Normalize: deduplicate and strip virtual "numero___disciplina" IDs
        // (produced when the server expands repetir_todas_disciplinas for a logged-in user)
        const rawIds = (avaliacao.questoes || []).map(q => normalizeVirtualQuestaoId(typeof q === 'object' ? q.id : q));
        setQuestoesSelecionadas([...new Set(rawIds.filter(id => !isNaN(id)))]);

        const unidadeIds = (avaliacao.unidade || []).map(u => u.id);
        setEditUnidadeIds(unidadeIds);

        const municipioNomes = [...new Set((avaliacao.unidade || []).map(u => u.municipio_vinculo).filter(Boolean))];
        const municipiosSelected = municipiosOptions.filter(opt =>
            municipioNomes.some(nome => opt.label.startsWith(nome + ' -') || opt.label === nome)
        );
        setMunicipiosVinculo(municipiosSelected.length ? municipiosSelected : municipiosOptions.slice(0, 0));
    }, [avaliacaoEditData, editMode, props.show, municipiosOptions.length]);

    // After municipalities are set, select the right unidades once they load
    useEffect(() => {
        if (!editMode || !editUnidadeIds.length || !unidadesOptions.length) return;
        const selected = unidadesOptions.filter(opt => editUnidadeIds.includes(opt.value));
        if (selected.length > 0) setUnidadeSelecionada(selected);
    }, [unidadesData, editUnidadeIds, editMode]);

    const handleCategoriasChange = (selected) => {
        const ultimaCategoriaSelecionada = selected?.length ? selected[selected.length - 1] : null;
        setCategoriasSelecionadas(ultimaCategoriaSelecionada ? [ultimaCategoriaSelecionada.value] : []);
    };

    useEffect(() => {
        if (!temCategoriaDiscente) {
            setModalidadeSelecionada([]);
            setCursosSelecionados([]);
            setCurso('');
        }
    }, [temCategoriaDiscente]);

    const handleCursoSelect = (selected) => {
        // Merge incoming list (already contains pre-seeded items from the modal) and deduplicate
        const seen = new Set();
        const merged = selected.filter(c => {
            const key = c.identificador_api_lyceum ?? c.id;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        setCursosSelecionados(merged);
        setCurso(merged.map(c => c.nome).join(', '));
        setShowCursoModal(false);
    };

    const handleQuestoesSelect = (selected) => {
        setQuestoesSelecionadas(selected);
        setShowQuestaoModal(false);
    };

    const salvarAvaliacao = async () => {
        if (!ano || !periodo) return setError('Preencha o período letivo.');
        if (!startDate || !endDate) return setError('Preencha as datas.');
        if (!unidadeSelecionada?.length) return setError('Selecione uma unidade.');

        if (temCategoriaDiscente && !modalidadeSelecionada.length) {
            return setError('Selecione ao menos uma modalidade quando a categoria DISCENTE for selecionada.');
        }

        if (temCategoriaDiscente && !cursosSelecionados.length) {
            return setError('Selecione ao menos um curso quando a categoria DISCENTE for selecionada.');
        }

        if (!questoesSelecionadas.length) return setError('Selecione uma questão.');

        setError('');

        const avaliacaoData = {
            unidade: unidadeSelecionada.map(q => q.value),
            cursos: cursosSelecionados.map(c => c.value ?? c.identificador_api_lyceum),
            categorias: categoriasSelecionadas,
            modalidade: modalidadeSelecionada.map(q => q.value),
            questoes: [...new Set(questoesSelecionadas.map(normalizeVirtualQuestaoId).filter(id => !isNaN(id)))],
            periodo_letivo: `${ano}.${periodo}`,
            data_inicio: startDate ? `${startDate}T00:00:00` : startDate,
            data_fim: endDate ? `${endDate}T23:59:59` : endDate,
            status: 1,
            ano,
        };

        if (editMode) {
            editAvaliacaoMutation.mutate({ id: props.avaliacaoId, data: avaliacaoData }, {
                onSuccess: () => props.onSuccess?.('Avaliação atualizada com sucesso!'),
                onError: (err) => setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao atualizar avaliação.')
            });
        } else {
            adicionarAvaliacaoMutation.mutate(avaliacaoData, {
                onSuccess: () => props.onSuccess?.('Avaliação criada com sucesso!'),
                onError: (err) => setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao criar avaliação.')
            });
        }
    };

    const modalActions = (
        <>
            <Button onClick={props.onHide} color="inherit" disabled={loading} sx={{ fontWeight: 600 }}>
                Cancelar
            </Button>
            <Button
                onClick={salvarAvaliacao}
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ fontWeight: 700, minWidth: '150px' }}
            >
                {loading ? 'Salvando...' : editMode ? 'Salvar Alterações' : 'Criar Avaliação'}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={props.show}
            onClose={props.onHide}
            title={editMode ? 'Editar Avaliação' : 'Nova Avaliação'}
            actions={modalActions}
            isLoading={loading}
            maxWidth="md"
        >
            <Box sx={{ mt: 1 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    {/* Linha 1: Período e Datas */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Ano"
                            placeholder="Ex: 2024"
                            value={ano}
                            onChange={e => setAno(e.target.value)}
                            size="small"
                            disabled={loading}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <TextField
                            select
                            fullWidth
                            label="Semestre"
                            value={periodo}
                            onChange={e => setPeriodo(e.target.value)}
                            size="small"
                            disabled={loading}
                            required
                            InputLabelProps={{ shrink: true }}
                        >
                            <MenuItem value="1">1º Semestre</MenuItem>
                            <MenuItem value="2">2º Semestre</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth
                            label="Data Início"
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            size="small"
                            disabled={loading}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth
                            label="Data Fim"
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            size="small"
                            disabled={loading}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Linha 2: Municípios e Unidades */}
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Municípios Vínculo
                        </Typography>
                        <AnimatedMultiSelect
                            options={municipiosOptions}
                            onChange={setMunicipiosVinculo}
                            placeholder="Selecione os municípios"
                            value={municipiosVinculo}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Unidade Responsável
                        </Typography>
                        <AnimatedMultiSelect
                            options={unidadesOptions}
                            onChange={setUnidadeSelecionada}
                            placeholder={municipiosVinculo.length === 0 ? 'Selecione um município primeiro' : 'Selecione a unidade'}
                            value={unidadeSelecionada}
                            disabled={municipiosVinculo.length === 0}
                        />
                    </Grid>

                    {/* Linha 3: Categorias e Modalidades */}
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Público Alvo (Categorias)
                        </Typography>
                        <AnimatedMultiSelect
                            options={categoriasOptions}
                            onChange={handleCategoriasChange}
                            placeholder="Selecione uma categoria"
                            value={categoriasOptions.filter(o => categoriasSelecionadas.includes(o.value))}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Modalidades
                        </Typography>
                        <AnimatedMultiSelect
                            options={modalidadesOptions}
                            onChange={setModalidadeSelecionada}
                            placeholder={temCategoriaDiscente ? 'Selecione as modalidades' : 'Modalidades não aplicáveis sem DISCENTE'}
                            value={modalidadeSelecionada}
                            disabled={!temCategoriaDiscente}
                        />
                    </Grid>

                    {/* Linha 4: Cursos */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                        <IoSchoolOutline /> Cursos Selecionados
                                        {cursosSelecionados.length > 0 && (
                                            <Badge badgeContent={cursosSelecionados.length} color="success" sx={{ ml: 1 }} />
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {cursosSelecionados.length > 0
                                            ? curso
                                            : "Nenhum curso selecionado ainda."}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<IoAddOutline />}
                                    onClick={() => setShowCursoModal(true)}
                                    disabled={!temCategoriaDiscente || !unidadeSelecionada || unidadeSelecionada.length === 0 || !modalidadeSelecionada || modalidadeSelecionada.length === 0}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Selecionar Cursos
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Linha 5: Questões */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<IoListOutline />}
                                onClick={() => setShowQuestaoModal(true)}
                                disabled={!categoriasSelecionadas.length}
                                sx={{ fontWeight: 700 }}
                            >
                                Incluir Questões
                                {questoesSelecionadas.length > 0 && (
                                    <Badge badgeContent={questoesSelecionadas.length} color="default" sx={{ ml: 2, '& .MuiBadge-badge': { bgcolor: 'white', color: 'success.main', fontWeight: 800 } }} />
                                )}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {showCursoModal && (
                <CursoSelectionModal
                    show={showCursoModal}
                    onHide={() => setShowCursoModal(false)}
                    onCursosSelected={handleCursoSelect}
                    unidadesSelecionadas={unidadeSelecionada}
                    modalidadesSelecionadas={modalidadeSelecionada}
                    initialSelectedCursos={cursosSelecionados}
                />
            )}

            {showQuestaoModal && (
                <QuestaoSelectionModal
                    show={showQuestaoModal}
                    onHide={() => setShowQuestaoModal(false)}
                    initialSelectedIds={questoesSelecionadas}
                    categoriaIds={categoriasSelecionadas}
                    onQuestoesSelected={handleQuestoesSelect}
                />
            )}
        </MuiBaseModal>
    );
}

export default Modal_Avaliacoes;