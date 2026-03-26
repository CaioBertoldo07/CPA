import React, { useEffect, useState, useMemo } from 'react';
import {
    TextField,
    Button,
    MenuItem,
    Box,
    Typography,
    Grid,
    FormControlLabel,
    Switch,
    IconButton,
    Tooltip,
    Alert,
    Divider,
    Paper
} from '@mui/material';
import { IoAddOutline, IoTrashOutline } from 'react-icons/io5';
import MuiBaseModal from '../utils/MuiBaseModal';
import AnimatedMultiSelect from '../utils/AnimatedMultiSelect';
import { useGetEixosQuery } from '../../hooks/queries/useEixoQueries';
import { useGetModalidadesQuery } from '../../hooks/queries/useModalidadeQueries';
import { useGetCategoriasQuery } from '../../hooks/queries/useCategoriaQueries';
import { useGetPadraoRespostaQuery } from '../../hooks/queries/usePadraoRespostaQueries';
import { useGetDimensoesByEixoQuery } from '../../hooks/queries/useDimensaoQueries';
import { useGetTiposQuestoesQuery } from '../../hooks/queries/useTipoQuestaoQueries';
import { useAdicionarQuestaoMutation, useEditQuestaoMutation } from '../../hooks/mutations/useQuestaoMutations';

function Modal_Questoes(props) {
    const { questao: editingQuestao, show, onHide, onSuccess } = props;

    const { data: eixos = [] } = useGetEixosQuery();
    const { data: padraoResposta = [] } = useGetPadraoRespostaQuery();
    const { data: tiposQuestoes = [] } = useGetTiposQuestoesQuery();
    const { data: modalidadesRaw = [] } = useGetModalidadesQuery();
    const { data: categoriasRaw = [] } = useGetCategoriasQuery();

    const [eixoSelecionado, setEixoSelecionado] = useState('');
    const { data: dimensoes = [] } = useGetDimensoesByEixoQuery(eixoSelecionado);

    const adicionarMutation = useAdicionarQuestaoMutation();
    const editarMutation = useEditQuestaoMutation();
    const isLoading = adicionarMutation.isPending || editarMutation.isPending;

    const [dimensaoSelecionada, setDimensaoSelecionada] = useState('');
    const [error, setError] = useState('');
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
    const [modalidadeSelecionada, setModalidadeSelecionada] = useState([]);
    const [basica, setBasica] = useState(false);
    const [descricaoQuestao, setDescricaoQuestao] = useState('');
    const [padraoRespostaSelecionado, setPadraoRespostaSelecionado] = useState('');
    const [tipoQuestao, setTipoQuestao] = useState('');
    const [questoesAdicionais, setQuestoesAdicionais] = useState([]);
    const [repetirTodasDisciplinas, setRepetirTodasDisciplinas] = useState(false);

    const modalidadesOptions = useMemo(() =>
        modalidadesRaw.map(m => ({ value: m.id, label: m.mod_ensino })),
        [modalidadesRaw]);

    const categoriasOptions = useMemo(() =>
        categoriasRaw.map(c => ({ value: c.id, label: c.nome })),
        [categoriasRaw]);

    useEffect(() => {
        if (editingQuestao && show) {
            setDescricaoQuestao(editingQuestao.descricao || '');
            setEixoSelecionado(editingQuestao.dimensao?.eixo?.numero || '');
            setDimensaoSelecionada(editingQuestao.dimensao?.numero || '');
            setBasica(editingQuestao.basica || false);
            setPadraoRespostaSelecionado(editingQuestao.idPadraoResposta || '');
            setTipoQuestao(editingQuestao.tipoId || '');
            setQuestoesAdicionais(editingQuestao.questoesAdicionais?.map(qa => qa.descricao) || []);
            setCategoriasSelecionadas(editingQuestao.categorias?.map(c => c.id) || []);
            setModalidadeSelecionada(editingQuestao.modalidades?.map(m => m.id) || []);
            setRepetirTodasDisciplinas(editingQuestao.repetir_todas_disciplinas || false);
        } else if (!show) {
            resetFormState();
        }
    }, [editingQuestao, show]);

    const resetFormState = () => {
        setDescricaoQuestao('');
        setEixoSelecionado('');
        setDimensaoSelecionada('');
        setCategoriasSelecionadas([]);
        setModalidadeSelecionada([]);
        setBasica(false);
        setPadraoRespostaSelecionado('');
        setTipoQuestao('');
        setError('');
        setQuestoesAdicionais([]);
        setRepetirTodasDisciplinas(false);
    };

    const handleQuestaoChange = (event) => setDescricaoQuestao(event.target.value);

    const handleEixoSelect = (event) => {
        setEixoSelecionado(event.target.value);
        setDimensaoSelecionada('');
    };

    const handleModalidadesChange = (selectedOptions) => {
        const selectedIds = selectedOptions.map(option => option.value);
        setModalidadeSelecionada(selectedIds);
    };

    const handleCategoriasChange = (selectedOptions) => {
        const selectedIds = selectedOptions.map(option => option.value);
        setCategoriasSelecionadas(selectedIds);
    };

    const handleBasicaToggle = (event) => setBasica(event.target.checked);

    const handlePadraoRespostaSelect = (event) => setPadraoRespostaSelecionado(event.target.value);

    const handleTipoQuestaoChange = (event) => setTipoQuestao(event.target.value);

    const handleAdicionarQuestaoAdicional = () => setQuestoesAdicionais([...questoesAdicionais, '']);

    const handleQuestaoAdicionalChange = (index, event) => {
        const newArray = [...questoesAdicionais];
        newArray[index] = event.target.value;
        setQuestoesAdicionais(newArray);
    };

    const handleRemoverQuestaoAdicional = (index) => {
        setQuestoesAdicionais(questoesAdicionais.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!descricaoQuestao.trim()) {
            return setError('O enunciado da questão não pode estar vazio.');
        }
        if (!dimensaoSelecionada) {
            return setError('Selecione uma dimensão para a questão.');
        }

        const questaoData = {
            questao: descricaoQuestao,
            dimensaoNumero: dimensaoSelecionada,
            padraoRespostaId: padraoRespostaSelecionado,
            basica,
            tipo_questao: tipoQuestao,
            categorias: categoriasSelecionadas,
            modalidades: modalidadeSelecionada,
            questoesAdicionais: questoesAdicionais.filter(q => q.trim()).map(item => ({ descricao: item })),
            repetir_todas_disciplinas: repetirTodasDisciplinas,
        };

        const mutation = editingQuestao ? editarMutation : adicionarMutation;
        const payload = editingQuestao ? { id: editingQuestao.id, questao: questaoData } : questaoData;

        mutation.mutate(payload, {
            onSuccess: () => {
                resetFormState();
                onHide();
                if (onSuccess) onSuccess('Questão salva com sucesso!');
            },
            onError: (err) => {
                setError(err.response?.data?.error || 'Falha ao salvar a questão');
            }
        });
    };

    const modalActions = (
        <>
            <Button
                onClick={onHide}
                color="inherit"
                disabled={isLoading}
                sx={{ fontWeight: 600 }}
            >
                Cancelar
            </Button>
            <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{
                    fontWeight: 700,
                    minWidth: '120px'
                }}
            >
                {editingQuestao ? 'Salvar Alterações' : 'Cadastrar Questão'}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={onHide}
            title={editingQuestao ? 'Editar Questão' : 'Nova Questão'}
            actions={modalActions}
            isLoading={isLoading}
            maxWidth="md"
        >
            <Box sx={{ mt: 1 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {editingQuestao?.isUsed && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Esta questão já está sendo utilizada em uma avaliação. 
                        Fique ciente de que qualquer alteração salvará uma <strong>nova cópia</strong> da questão, mantendo a original vinculada às avaliações atuais.
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Enunciado Principal
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Digite o enunciado da nova questão..."
                        value={descricaoQuestao}
                        onChange={handleQuestaoChange}
                        disabled={isLoading}
                        variant="outlined"
                        sx={{ mt: 1 }}
                    />
                </Box>

                {tipoQuestao?.toString() === '2' && (
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                                Sub-Questões (Itens da Grade)
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<IoAddOutline />}
                                onClick={handleAdicionarQuestaoAdicional}
                                disabled={isLoading}
                                variant="outlined"
                            >
                                Adicionar Item
                            </Button>
                        </Box>
                        <Grid container spacing={2}>
                            {questoesAdicionais.map((qAd, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={qAd}
                                            onChange={(event) => handleQuestaoAdicionalChange(index, event)}
                                            placeholder={`Item ${index + 1}`}
                                            disabled={isLoading}
                                        />
                                        <Tooltip title="Remover">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoverQuestaoAdicional(index)}
                                                disabled={isLoading}
                                                size="small"
                                            >
                                                <IoTrashOutline />
                                            </IconButton>
                                        </Tooltip>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    Configurações e Classificação
                </Typography>

                <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'grey.50', mb: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Eixo"
                                value={eixoSelecionado}
                                onChange={handleEixoSelect}
                                size="small"
                                disabled={isLoading}
                                InputLabelProps={{ shrink: true }}
                            >
                                {eixos.map(eixo => (
                                    <MenuItem key={eixo.id} value={eixo.numero}>{eixo.nome}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Dimensão"
                                value={dimensaoSelecionada}
                                onChange={(e) => setDimensaoSelecionada(e.target.value)}
                                size="small"
                                disabled={isLoading || !eixoSelecionado}
                                InputLabelProps={{ shrink: true }}
                                error={!dimensaoSelecionada && !!eixoSelecionado}
                                helperText={!eixoSelecionado ? "Selecione um eixo primeiro" : ""}
                            >
                                {dimensoes.map(dimensao => (
                                    <MenuItem key={dimensao.numero} value={dimensao.numero}>{dimensao.nome}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Tipo de Questão"
                                value={tipoQuestao}
                                onChange={handleTipoQuestaoChange}
                                size="small"
                                disabled={isLoading}
                                InputLabelProps={{ shrink: true }}
                            >
                                {tiposQuestoes.map(tipo => (
                                    <MenuItem key={tipo.id} value={tipo.id}>{tipo.descricao}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Padrão de Resposta"
                                value={padraoRespostaSelecionado}
                                onChange={handlePadraoRespostaSelect}
                                size="small"
                                disabled={isLoading}
                                InputLabelProps={{ shrink: true }}
                            >
                                {padraoResposta.map(padrao => (
                                    <MenuItem key={padrao.id} value={padrao.id}>{padrao.sigla}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                Modalidades Aplicáveis
                            </Typography>
                            <AnimatedMultiSelect
                                options={modalidadesOptions}
                                onChange={handleModalidadesChange}
                                placeholder="Selecione as modalidades..."
                                value={modalidadesOptions.filter(o => modalidadeSelecionada.includes(o.value))}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                Categorias Aplicáveis
                            </Typography>
                            <AnimatedMultiSelect
                                options={categoriasOptions}
                                onChange={handleCategoriasChange}
                                placeholder="Selecione as categorias..."
                                value={categoriasOptions.filter(o => categoriasSelecionadas.includes(o.value))}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={repetirTodasDisciplinas}
                                        onChange={(e) => setRepetirTodasDisciplinas(e.target.checked)}
                                        disabled={isLoading}
                                        color="warning"
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Repetir para todas as disciplinas</Typography>}
                                labelPlacement="start"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={basica}
                                        onChange={handleBasicaToggle}
                                        disabled={isLoading}
                                        color="primary"
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Questão Básica (Geral)</Typography>}
                                labelPlacement="start"
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </MuiBaseModal >
    );
}

export default Modal_Questoes;
