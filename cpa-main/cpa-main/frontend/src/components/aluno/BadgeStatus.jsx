import { Chip } from '@mui/material';

const statusConfig = {
    disponivel: {
        label: 'Disponível',
        sx: { bgcolor: '#dcfce7', color: '#166534' },
    },
    respondida: {
        label: 'Respondida',
        sx: { bgcolor: '#e0f2fe', color: '#0369a1' },
    },
    encerrada: {
        label: 'Encerrada',
        sx: { bgcolor: '#f1f5f9', color: '#64748b' },
    },
};

const BadgeStatus = ({ status }) => {
    const config = statusConfig[status] ?? statusConfig.encerrada;

    return (
        <Chip
            label={config.label}
            size="small"
            sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                border: 'none',
                ...config.sx,
            }}
        />
    );
};

export default BadgeStatus;
