import { env } from '../config/env';

export interface EmailTemplate {
    subject: string;
    body: string;
    systemUrl: string;
}

const fmtDate = (d?: Date | string): string => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-BR');
};

export function buildEnvioAvaliacaoEmailTemplate(avaliacao: {
    titulo?: string;
    periodo_letivo?: string;
    data_inicio?: Date | string;
    data_fim?: Date | string;
}): EmailTemplate {
    const systemUrl = env.APP_PUBLIC_URL;

    if (!systemUrl) {
        throw new Error('APP_PUBLIC_URL não configurada');
    }

    const periodoInfo = avaliacao.periodo_letivo
        ? `Período letivo: ${avaliacao.periodo_letivo}`
        : '';

    const vigenciaInfo =
        avaliacao.data_inicio && avaliacao.data_fim
            ? `Vigência: ${fmtDate(avaliacao.data_inicio)} a ${fmtDate(avaliacao.data_fim)}`
            : '';

    const lines = [
        'Olá!',
        '',
        'Uma nova avaliação da Comissão Própria de Avaliação (CPA) está disponível para resposta.',
        periodoInfo,
        vigenciaInfo,
        '',
        `Acesse o sistema pelo link:\n${systemUrl}`,
        '',
        'Sua participação é muito importante para a melhoria da Universidade.',
        '',
        'Atenciosamente,',
        'Comissão Própria de Avaliação - CPA',
    ].filter((line, i, arr) => !(line === '' && arr[i - 1] === ''));

    return {
        subject: 'Nova avaliação CPA disponível',
        body: lines.join('\n'),
        systemUrl,
    };
}
