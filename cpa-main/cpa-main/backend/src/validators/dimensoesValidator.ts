import * as yup from 'yup';

export const createDimensaoSchema = yup.object().shape({
    numero: yup.number().required('Número da dimensão é obrigatório'),
    nome: yup.string().required('Nome da dimensão é obrigatório'),
    numero_eixos: yup.number().required('Número do eixo associado é obrigatório'),
});

export const updateDimensaoSchema = yup.object().shape({
    nome: yup.string().optional(),
    numero_eixos: yup.number().optional(),
});
