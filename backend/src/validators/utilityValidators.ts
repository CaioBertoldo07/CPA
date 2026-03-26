import * as yup from 'yup';

export const categoriaSchema = yup.object().shape({
    nome: yup.string().required('Nome da categoria é obrigatório')
});

export const modalidadeSchema = yup.object().shape({
    mod_ensino: yup.string().required('Modalidade de ensino é obrigatória'),
    mod_oferta: yup.string().optional()
});
