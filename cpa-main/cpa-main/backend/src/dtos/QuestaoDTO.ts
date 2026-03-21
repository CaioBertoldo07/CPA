/**
 * DTO para Resposta de Questão
 */
export interface QuestaoResponseDTO {
    id: number;
    descricao: string;
    basica: boolean;
    tipo: string;
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
        id_questoes: number;
        id_questoes_tipo: number;
        ordem: number;
        descricao: string;
    }>;
}

/**
 * DTO para Atualização de Questão
 */
export interface UpdateQuestaoDTO extends Partial<CreateQuestaoDTO> { }
