import * as yup from 'yup';

export const salvarRespostasSchema = yup.object().shape({
    idAvaliacao: yup.number().required(),
    respostas: yup.array().of(
        yup.object().shape({
            id_avaliacao_questoes: yup.number().required(),
            valor: yup.number().optional(),
            id_alternativa: yup.number().optional(),
            comentario: yup.string().optional(),
            id_questoes_adicionais: yup.mixed().optional()
        })
    ).required().min(1)
});

export const relatorioFiltrosSchema = yup.object().shape({
    idAvaliacao: yup.number().optional(),
    idEixo: yup.number().optional(),
    idDimensao: yup.number().optional(),
    idUnidade: yup.number().optional(),
    idCurso: yup.number().optional()
});
