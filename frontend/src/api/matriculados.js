import api from './index';

// Taxa de participacao por curso (respondentes / matriculados) de uma avaliacao.
// O periodo e derivado da propria avaliacao no backend.
export const getParticipacaoPorCurso = (idAvaliacao) =>
    api.get(`/avaliacoes/${idAvaliacao}/participacao`);

// Dispara a sincronizacao do snapshot de matriculados a partir do Lyceum.
export const sincronizarMatriculados = ({ ano, semestre } = {}) =>
    api.post('/matriculados/sincronizar', { ano, semestre });
