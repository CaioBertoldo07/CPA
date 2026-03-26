import * as yup from 'yup';

export const createQuestaoSchema = yup.object().shape({
    questao: yup.string().required('Descrição da questão é obrigatória'),
    dimensaoNumero: yup.number().required('Número da dimensão é obrigatório'),
    categorias: yup.array().of(yup.mixed()).required('Pelo menos uma categoria é obrigatória'),
    modalidades: yup.array().of(yup.number()).required('Pelo menos uma modalidade é obrigatória'),
    padraoRespostaId: yup.number().required('ID do padrão de resposta é obrigatório'),
    basica: yup.boolean().required('Informação se é básica é obrigatória'),
    tipo_questao: yup.number().required('Tipo da questão é obrigatório'),
    questoesAdicionais: yup.array().optional(),
    repetir_todas_disciplinas: yup.boolean().optional()
});

export const updateQuestaoSchema = yup.object().shape({
    questao: yup.string().optional(),
    dimensaoNumero: yup.number().optional(),
    categorias: yup.array().of(yup.mixed()).optional(),
    modalidades: yup.array().of(yup.number()).optional(),
    padraoRespostaId: yup.number().optional(),
    basica: yup.boolean().optional(),
    tipo_questao: yup.number().optional(),
    questoesAdicionais: yup.array().optional(),
    repetir_todas_disciplinas: yup.boolean().optional()
});
