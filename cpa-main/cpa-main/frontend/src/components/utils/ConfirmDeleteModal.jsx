import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import MuiBaseModal from './MuiBaseModal';

/**
 * A reusable confirmation modal for deletion actions, standardized with MUI.
 * @param {Object} props - Component props.
 * @param {boolean} props.show - Whether the modal is visible.
 * @param {Function} props.onConfirm - Callback for when the user confirms deletion.
 * @param {Function} props.onCancel - Callback for when the user cancels deletion.
 * @param {string} props.title - Modal title (optional).
 * @param {string} props.message - Custom message to display (optional).
 * @param {boolean} props.loading - Whether the deletion is in progress.
 */
const ConfirmDeleteModal = ({
    show,
    onConfirm,
    onCancel,
    title = "Confirmar Exclusão",
    message = "Tem certeza que deseja excluir este item?",
    loading = false
}) => {
    const modalActions = (
        <>
            <Button
                onClick={onCancel}
                color="inherit"
                disabled={loading}
                sx={{ fontWeight: 600 }}
            >
                Cancelar
            </Button>
            <Button
                onClick={onConfirm}
                variant="contained"
                color="error"
                disabled={loading}
                sx={{
                    fontWeight: 700,
                    minWidth: '100px',
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
                }}
            >
                {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
        </>
    );

    return (
        <MuiBaseModal
            open={show}
            onClose={onCancel}
            title={title}
            actions={modalActions}
            isLoading={loading}
            maxWidth="xs"
        >
            <Box sx={{ py: 1 }}>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 1.5 }}>
                    {message}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Esta ação não pode ser desfeita.
                </Typography>
            </Box>
        </MuiBaseModal>
    );
};

export default ConfirmDeleteModal;
