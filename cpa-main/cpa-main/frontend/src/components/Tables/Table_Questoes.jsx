// src/components/Tables/Table_Questoes.js
import React, { useEffect, useState, useMemo } from 'react';
import { useGetQuestoesQuery } from "../../hooks/queries/useQuestaoQueries";
import { useDeleteQuestaoMutation } from "../../hooks/mutations/useQuestaoMutations";
import { getQuestaoById } from "../../api/questoes";
import { useNotification } from "../../context/NotificationContext";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ModalQuestoes from '../Modals/Modal_Questoes';
import ConfirmDeleteModal from '../utils/ConfirmDeleteModal';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Box, IconButton, Tooltip, Typography, Chip, Button, Autocomplete, TextField, Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function MultiSelectFilterInput(props) {
    const { item, applyValue, options } = props;

    const handleChange = (_, newValue) => {
        applyValue({ ...item, value: newValue.map(o => (o && typeof o === 'object') ? o.value : o) });
    };

    const value = (item.value || []).map(v => 
        options.find(o => (o && typeof o === 'object' ? o.value : o) === v) || v
    );

    return (
        <Autocomplete
            multiple
            options={options}
            disableCloseOnSelect
            getOptionLabel={(option) => (option && typeof option === 'object') ? option.label : option}
            value={value}
            onChange={handleChange}
            renderOption={(props, option, { selected }) => (
                <li {...props} key={`${(option && typeof option === 'object') ? option.value : option}`}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {(option && typeof option === 'object') ? option.label : option}
                </li>
            )}
            style={{ width: '100%', minWidth: 200 }}
            renderInput={(params) => (
                <TextField {...params} label="Valores" placeholder="Selecionar..." variant="standard" />
            )}
        />
    );
}

const getMultiSelectOperators = (options) => [
    {
        label: 'É um de',
        value: 'isAnyOf',
        getApplyFilterFn: (filterItem) => {
            if (!filterItem.value || filterItem.value.length === 0) return null;
            
            // Convert selected values to strings for robust comparison
            const selectedValues = filterItem.value.map(String);
            
            return (value) => {
                if (value === null || value === undefined) return false;
                
                // Para categorias, o valor é um array de IDs.
                if (Array.isArray(value)) {
                    return value.some(id => selectedValues.includes(String(id)));
                }
                
                return selectedValues.includes(String(value));
            };
        },
        InputComponent: MultiSelectFilterInput,
        InputComponentProps: { options },
    },
];

const Table_Questoes = ({ 
    searchQuery = '', 
    onSuccess, 
    selectedEixoIds = [], 
    selectedDimensaoIds = [], 
    selectedCategoriaIds = [],
    eixosOptions = [],
    dimensoesOptions = [],
    categoriasOptions = []
}) => {
    const { data: dataQuestoes = [], isLoading: loadingTable, isError } = useGetQuestoesQuery();
    const deleteMutation = useDeleteQuestaoMutation();
    const showNotification = useNotification();

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingQuestao, setDeletingQuestao] = useState(null);

    useEffect(() => { if (isError) showNotification('Erro ao carregar questões.', 'error'); }, [isError, showNotification]);

    const handleEditQuestion = async (questao) => {
        try {
            const details = await getQuestaoById(questao.id);
            setSelectedQuestion(details);
            setShowEditModal(true);
        } catch (error) {
            showNotification('Erro ao carregar detalhes da questão.', 'error');
        }
    };

    const handleEditSaved = (message) => {
        setShowEditModal(false);
        setSelectedQuestion(null);
        if (onSuccess) onSuccess(message || 'Questão atualizada com sucesso!');
    };

    const handleDeleteRequest = (questao) => {
        setDeletingQuestao(questao);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (!deletingQuestao) return;
        deleteMutation.mutate(deletingQuestao.id, {
            onSuccess: () => {
                if (onSuccess) onSuccess('Questão excluída com sucesso!');
                setShowDeleteModal(false);
                setDeletingQuestao(null);
            },
            onError: (err) => showNotification(err?.response?.data?.message || 'Erro ao excluir questão. Tente novamente.', 'error')
        });
    };

    const rows = useMemo(() => dataQuestoes, [dataQuestoes]);

    const filterModel = useMemo(() => {
        const items = [];
        // Se houver pesquisa, aplicamos na descrição. 
        // Nota: O DataGrid Community filtra as colunas com lógica AND.
        if (searchQuery) items.push({ field: 'descricao', operator: 'contains', value: searchQuery });
        if (selectedEixoIds.length > 0) items.push({ field: 'eixo', operator: 'isAnyOf', value: selectedEixoIds });
        if (selectedDimensaoIds.length > 0) items.push({ field: 'dimensao', operator: 'isAnyOf', value: selectedDimensaoIds });
        if (selectedCategoriaIds.length > 0) items.push({ field: 'categorias', operator: 'isAnyOf', value: selectedCategoriaIds });
        return { items, logicOperator: 'and' }; // logicOperator é padrão, mas garantimos aqui
    }, [searchQuery, selectedEixoIds, selectedDimensaoIds, selectedCategoriaIds]);

    const columns = [
        {
            field: 'descricao',
            headerName: 'Questão',
            flex: 2,
            minWidth: 350,
            renderCell: (params) => (
                <Box sx={{ py: 1, whiteSpace: 'normal', lineHeight: '1.4' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a202c' }}>
                        {params.value}
                    </Typography>
                    {params.row.questoesAdicionais?.length > 0 && (
                        <Box sx={{ mt: 1, pl: 1.5, borderLeft: '2px solid #e2e8f0' }}>
                            {params.row.questoesAdicionais.map(qa => (
                                <Typography key={qa.id} variant="caption" display="block" sx={{ color: '#64748b' }}>
                                    • {qa.descricao}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </Box>
            )
        },
        {
            field: 'eixo',
            headerName: 'Eixo',
            width: 150,
            valueGetter: (value, row) => row.dimensao?.eixo?.numero || null,
            filterOperators: getMultiSelectOperators(eixosOptions),
            renderCell: (params) => {
                const label = eixosOptions.find(o => o.value === params.value)?.label?.split('. ')[1] || params.row.dimensao?.eixo?.nome || 'N/A';
                return (
                    <Chip
                        label={label}
                        size="small"
                        variant="outlined"
                        sx={{ bgcolor: '#f8fafc', borderColor: '#e2e8f0', fontSize: '0.7rem' }}
                    />
                );
            }
        },
        {
            field: 'dimensao',
            headerName: 'Dimensão',
            width: 180,
            valueGetter: (value, row) => row.dimensao?.numero || null,
            filterOperators: getMultiSelectOperators(dimensoesOptions),
            renderCell: (params) => {
                const label = dimensoesOptions.find(o => o.value === params.value)?.label || params.row.dimensao?.nome || 'N/A';
                return (
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {label}
                    </Typography>
                );
            }
        },
        {
            field: 'categorias',
            headerName: 'Categorias',
            width: 180,
            sortable: false,
            valueGetter: (value, row) => row.categorias?.map(c => c.id) || [],
            filterOperators: getMultiSelectOperators(categoriasOptions),
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {params.row.categorias?.length > 0 ? (
                        params.row.categorias.map(c => (
                            <Chip
                                key={c.id}
                                label={c.nome}
                                size="small"
                                sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontSize: '0.65rem', fontWeight: 600, height: 20 }}
                            />
                        ))
                    ) : (
                        <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Sem categorias</Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 200,
            sortable: false,
            filterable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                    <Tooltip title="Editar">
                        <Button
                            size="small"
                            variant="text"
                            startIcon={<FaRegEdit size={14} />}
                            onClick={() => handleEditQuestion(params.row)}
                            sx={{
                                color: '#1D5E24',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                '&:hover': { bgcolor: '#e8f5e9' }
                            }}
                        >
                            Editar
                        </Button>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <Button
                            size="small"
                            variant="text"
                            color="error"
                            startIcon={<IoTrashOutline size={15} />}
                            onClick={() => handleDeleteRequest(params.row)}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                '&:hover': { bgcolor: '#fee2e2' }
                            }}
                        >
                            Excluir
                        </Button>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ width: '100%', height: 700 }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loadingTable}
                getRowHeight={() => 'auto'}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                density="compact"
                disableRowSelectionOnClick
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                filterModel={filterModel}
                onFilterModelChange={() => { }}
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': { py: 1 },
                    '& .MuiDataGrid-cell:focus': { outline: 'none' },
                    '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
                    '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        textTransform: 'uppercase',
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#718096',
                            letterSpacing: '0.5px'
                        }
                    }
                }}
            />

            {showEditModal && selectedQuestion && (
                <ModalQuestoes
                    show={showEditModal}
                    onHide={() => { setShowEditModal(false); setSelectedQuestion(null); }}
                    questao={selectedQuestion}
                    onUpdateQuestion={handleEditSaved}
                    onSuccess={handleEditSaved}
                />
            )}

            <ConfirmDeleteModal
                show={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setShowDeleteModal(false); setDeletingQuestao(null); }}
                message={deletingQuestao ? `Tem certeza que deseja excluir a questão "${deletingQuestao.descricao}"?` : ""}
                loading={deleteMutation.isPending}
            />
        </Box>
    );
};

export default Table_Questoes;
