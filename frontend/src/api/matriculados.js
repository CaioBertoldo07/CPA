import api from './index';

// Taxa de participacao por curso (respondentes / matriculados) de uma avaliacao.
export const getParticipacaoPorCurso = (idAvaliacao, params = {}) => {
    const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return api.get(`/avaliacoes/${idAvaliacao}/participacao${qs ? `?${qs}` : ''}`);
};

// Dispara a sincronizacao do snapshot de matriculados a partir do Lyceum.
export const sincronizarMatriculados = ({ ano, semestre } = {}) =>
    api.post('/matriculados/sincronizar', { ano, semestre });
