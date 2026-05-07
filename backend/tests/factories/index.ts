import { CreateAvaliacaoDTO } from '../../src/dtos/AvaliacaoDTO';

export function createTestPadraoResposta() {
    return {
        id: 1,
        sigla: 'ST',
        alternativas: [
            createTestAlternativa(1, 1, 'Satisfatorio'),
            createTestAlternativa(1, 2, 'Parcialmente satisfatorio'),
            createTestAlternativa(1, 3, 'Insatisfatorio'),
        ],
    };
}

export function createTestAlternativa(
    padraoId: number,
    id = 1,
    descricao = 'Satisfatorio',
) {
    return {
        id,
        descricao,
        id_padrao_resp: padraoId,
    };
}

export function createTestQuestao(padraoId: number, dimensaoNum: number) {
    return {
        id: 1,
        descricao: 'Como voce avalia a atividade?',
        basica: true,
        id_padrao_resposta: padraoId,
        numero_dimensoes: dimensaoNum,
        id_questoes_tipo: 1,
        ativo: true,
    };
}

export function createTestAvaliacao(): CreateAvaliacaoDTO {
    return {
        unidade: [1],
        cursos: ['CURSO_TESTE'],
        categorias: [1],
        modalidade: [1],
        questoes: [1],
        periodo_letivo: '2025.1',
        data_inicio: '2025-01-10',
        data_fim: '2025-12-10',
        status: 1,
        ano: '2025',
    };
}
