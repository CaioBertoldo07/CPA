/**
 * DTO para Resposta de Questão
 */
export interface QuestaoResponseDTO {
    id: number;
    descricao: string;
    basica: boolean;
    tipo: string;
    tipoId: number;
    idPadraoResposta: number;
    dimensao: {
        nome: string;
        numero: number;
        eixo: {
            nome: string;
            numero: number;
        };
    };
    categorias: Array<{
        id: number;
        nome: string;
    }>;
    modalidades: Array<{
        id: number;
        nome: string;
    }>;
    questoesAdicionais?: any[];
    isUsed?: boolean;
    repetir_todas_disciplinas: boolean;
}

/**
 * DTO para Criação de Questão
 */
export interface CreateQuestaoDTO {
    questao: string;
    dimensaoNumero: number;
    categorias: Array<number | string>;
    modalidades: number[];
    padraoRespostaId: number;
    basica: boolean;
    tipo_questao: number;
    questoesAdicionais?: Array<{
        descricao: string;
    }>;
    repetir_todas_disciplinas?: boolean;
}

/**
 * DTO para Atualização de Questão
 */
export interface UpdateQuestaoDTO extends Partial<CreateQuestaoDTO> { }
