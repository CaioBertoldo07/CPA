import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    useTheme,
    alpha,
} from '@mui/material';
import { IoHelpCircleOutline, IoChevronDownOutline } from 'react-icons/io5';
import LayoutAvaliador from '../../components/avaliador/LayoutAvaliador';

const faqs = [
    {
        pergunta: 'O que é a CPA?',
        resposta: 'A Comissão Própria de Avaliação (CPA) é responsável por conduzir os processos de avaliação interna da instituição, com o objetivo de melhorar a qualidade do ensino e dos serviços oferecidos.',
    },
    {
        pergunta: 'As avaliações são anônimas?',
        resposta: 'Sim. Todas as respostas são 100% anônimas. Suas informações pessoais não são vinculadas às suas respostas.',
    },
    {
        pergunta: 'Posso responder uma avaliação mais de uma vez?',
        resposta: 'Não. Cada avaliação pode ser respondida apenas uma vez por avaliador. Após o envio, a avaliação aparecerá na seção "Respondidas".',
    },
    {
        pergunta: 'O que acontece se eu fechar a avaliação no meio?',
        resposta: 'As respostas ainda não enviadas serão perdidas. Recomendamos reservar alguns minutos para responder a avaliação completamente antes de enviá-la.',
    },
    {
        pergunta: 'Como acesso minhas avaliações disponíveis?',
        resposta: 'Acesse o menu "Minhas Avaliações" na sidebar à esquerda. As avaliações disponíveis para resposta aparecem como cards clicáveis.',
    },
    {
        pergunta: 'Preciso de ajuda técnica. Com quem falo?',
        resposta: 'Em caso de problemas técnicos, entre em contato com a equipe de suporte da CPA UEA pelo e-mail institucional.',
    },
];

const AvaliadorAjuda = () => {
    const theme = useTheme();

    return (
        <LayoutAvaliador>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                    p: 0.75, borderRadius: '8px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main', display: 'flex',
                }}>
                    <IoHelpCircleOutline size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Ajuda / Perguntas Frequentes</Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                }}
            >
                {faqs.map((faq, idx) => (
                    <Accordion
                        key={idx}
                        elevation={0}
                        disableGutters
                        sx={{
                            borderBottom: idx < faqs.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            '&:before': { display: 'none' },
                            '&.Mui-expanded': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<IoChevronDownOutline size={16} />}
                            sx={{
                                px: 3,
                                py: 0.5,
                                '& .MuiAccordionSummary-content': { my: 1.5 },
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {faq.pergunta}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 2.5, pt: 0 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                {faq.resposta}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Paper>
        </LayoutAvaliador>
    );
};

export default AvaliadorAjuda;
