import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { IoClose } from 'react-icons/io5';

/**
 * MuiBaseModal - A standardized modal using Material UI
 * 
 * @param {boolean} open - Whether the modal is visible
 * @param {function} onClose - Function to call when closing the modal
 * @param {string} title - The title of the modal
 * @param {React.ReactNode} children - The content of the modal
 * @param {React.ReactNode} actions - Action buttons at the bottom
 * @param {boolean} isLoading - If true, displays a loading overlay on the actions/content
 * @param {string} maxWidth - MUI maxWidth property (xs, sm, md, lg, xl)
 */
const MuiBaseModal = ({
    open,
    onClose,
    title,
    children,
    actions,
    isLoading = false,
    maxWidth = 'sm',
    fullWidth = true
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            fullScreen={fullScreen}
            aria-labelledby="base-modal-title"
            PaperProps={{
                sx: {
                    padding: '8px',
                    position: 'relative'
                }
            }}
        >
            <DialogTitle id="base-modal-title" sx={{ m: 0, p: 2, pr: 6 }}>
                <Typography variant="h6" component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {title}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={isLoading}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <IoClose />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 3, pb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                    {children}
                    {isLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                zIndex: 1,
                                borderRadius: 1
                            }}
                        >
                            <CircularProgress size={32} />
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                {actions}
            </DialogActions>
        </Dialog>
    );
};

export default MuiBaseModal;
