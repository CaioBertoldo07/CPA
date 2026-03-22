import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

/**
 * A reusable confirmation modal for deletion actions.
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
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
                <p className="text-muted small">Esta ação não pode ser desfeita.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading} style={{ minWidth: 100 }}>
                    {loading ? (
                        <>
                            <Spinner size="sm" animation="border" className="me-2" />
                            Excluindo...
                        </>
                    ) : (
                        'Excluir'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmDeleteModal;
