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
<<<<<<< HEAD
import { ptBR } from '@mui/x-data-grid/locales'
=======
import { ptBR } from '@mui/x-data-grid/locales';
>>>>>>> b36eede (fix: re-stabilize frontend after git merge and manual reverts)
import { Box, IconButton, Tooltip, Typography, Chip } from '@mui/material';

const Table_Questoes = ({ searchQuery = '', onSuccess }) => {
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

    const rows = useMemo(() => {
        const term = searchQuery.toLowerCase();
        return dataQuestoes.filter(q =>
            (q.descricao || '').toLowerCase().includes(term) ||
            (q.dimensao?.nome || '').toLowerCase().includes(term) ||
            (q.dimensao?.eixo?.nome || '').toLowerCase().includes(term)
        );
    }, [dataQuestoes, searchQuery]);

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
            valueGetter: (value, row) => row.dimensao?.eixo?.nome || 'N/A',
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    variant="outlined"
                    sx={{ bgcolor: '#f8fafc', borderColor: '#e2e8f0', fontSize: '0.7rem' }}
                />
            )
        },
        {
            field: 'dimensao',
            headerName: 'Dimensão',
            width: 180,
            valueGetter: (value, row) => row.dimensao?.nome || 'N/A',
            renderCell: (params) => (
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'categorias',
            headerName: 'Categorias',
            width: 180,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {params.value?.length > 0 ? (
                        params.value.map(c => (
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
            width: 110,
            sortable: false,
            filterable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Editar">
                        <IconButton
                            size="small"
                            onClick={() => handleEditQuestion(params.row)}
                            sx={{ color: '#1D5E24', '&:hover': { bgcolor: '#e8f5e9' } }}
                        >
                            <FaRegEdit size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton
                            size="small"
                            onClick={() => handleDeleteRequest(params.row)}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                        >
                            <IoTrashOutline size={16} />
                        </IconButton>
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
                disableRowSelectionOnClick
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
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
