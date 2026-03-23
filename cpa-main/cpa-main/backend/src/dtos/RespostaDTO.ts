export interface RespostaInputDTO {
    id_avaliacao_questoes: number;
    valor?: number;
    id_alternativa?: number;
    comentario?: string;
    id_questoes_adicionais?: number | string;
}

export interface SalvarRespostasDTO {
    idAvaliacao: number;
    respostas: RespostaInputDTO[];
}

export interface RelatorioFiltrosDTO {
    idAvaliacao?: number;
    idEixo?: number;
    idDimensao?: number;
    idUnidade?: number;
    idCurso?: number;
}
