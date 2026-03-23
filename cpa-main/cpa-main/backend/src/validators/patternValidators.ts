import * as yup from 'yup';

export const padraoRespostaSchema = yup.object().shape({
    sigla: yup.string().required('Sigla é obrigatória')
});

export const alternativaSchema = yup.object().shape({
    descricao: yup.string().required('Descrição é obrigatória'),
    id_padrao_resp: yup.number().required('ID do padrão de resposta é obrigatório')
});
