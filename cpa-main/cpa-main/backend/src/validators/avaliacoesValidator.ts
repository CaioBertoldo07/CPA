import * as yup from 'yup';

export const createAvaliacaoSchema = yup.object().shape({
    ano: yup.number().required('Ano é obrigatório.'),
    periodo_letivo: yup.string().required('Período letivo é obrigatório.'),
    data_inicio: yup.date().required('Data de início é obrigatória.'),
    data_fim: yup.date().required('Data de encerramento é obrigatória.').min(
        yup.ref('data_inicio'),
        'A data de encerramento deve ser posterior à data de início.'
    ),
    unidade: yup.array().of(yup.number()).min(1, 'Pelo menos uma unidade deve ser selecionada.').required(),
    cursos: yup.array().of(yup.string()).min(1, 'Pelo menos um curso deve ser selecionado.').required(),
    categorias: yup.array().of(yup.number()).min(1, 'Pelo menos uma categoria deve ser selecionada.').required(),
    modalidade: yup.array().of(yup.number()).min(1, 'Pelo menos uma modalidade deve ser selecionada.').required(),
    questoes: yup.array().of(yup.number()).min(1, 'Pelo menos uma questão deve ser selecionada.').required(),
    status: yup.number().required()
});
