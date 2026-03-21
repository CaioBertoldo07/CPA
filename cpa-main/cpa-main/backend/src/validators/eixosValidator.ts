import * as yup from 'yup';

export const createEixoSchema = yup.object().shape({
    numero: yup.number().required('Número do eixo é obrigatório'),
    nome: yup.string().required('Nome do eixo é obrigatório'),
    dimensoes: yup.array().of(
        yup.object().shape({
            numero: yup.number().required(),
            nome: yup.string().required()
        })
    ).min(1, 'Pelo menos uma dimensão deve ser informada').required()
});

export const updateEixoSchema = yup.object().shape({
    nome: yup.string().required('Nome é obrigatório para atualização')
});
