import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Button,
    Divider,
} from '@mui/material';
import { IoCalendarOutline, IoPlayOutline, IoCheckmarkCircleOutline, IoLockClosedOutline } from 'react-icons/io5';
import BadgeStatus from './BadgeStatus';

const CardAvaliacao = ({ avaliacao, variant = 'disponivel', onResponder }) => {
    const isDisponivel = variant === 'disponivel';

    const cardContent = (
        <CardContent sx={{ p: 2.5, pb: '16px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'primary.main' }}>
                    <IoCalendarOutline size={15} />
                    <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {avaliacao.periodo_letivo}
                    </Typography>
                </Box>
                <BadgeStatus status={variant} />
            </Box>

            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: 700,
                    mb: 2,
                    minHeight: '3em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                    color: 'text.primary',
                }}
            >
                {avaliacao.titulo}
            </Typography>

            <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <IoCheckmarkCircleOutline size={15} />
                    <Typography variant="caption">100% Anônimo</Typography>
                </Box>

                {isDisponivel ? (
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<IoPlayOutline />}
                        sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', px: 2 }}
                    >
                        Responder
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}>
                        <IoLockClosedOutline size={15} />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>Concluída</Typography>
                    </Box>
                )}
            </Box>
        </CardContent>
    );

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: '12px',
                border: '1px solid',
                borderColor: isDisponivel ? 'divider' : '#e2e8f0',
                bgcolor: isDisponivel ? 'background.paper' : '#fafafa',
                transition: 'all 0.25s ease',
                ...(isDisponivel && {
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.12)',
                        borderColor: 'primary.main',
                    },
                }),
            }}
        >
            {isDisponivel ? (
                <CardActionArea onClick={onResponder} sx={{ borderRadius: '12px' }}>
                    {cardContent}
                </CardActionArea>
            ) : (
                cardContent
            )}
        </Card>
    );
};

export default CardAvaliacao;
