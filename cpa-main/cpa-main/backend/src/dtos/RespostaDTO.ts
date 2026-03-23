export interface RespostaInputDTO {
    id_avaliacao_questoes: number;
    valor?: number;
    comentario?: string;
    id_questoes_adicionais?: number | string;
}

export interface SalvarRespostasDTO {
    respostas: RespostaInputDTO[];
}

export interface RelatorioFiltrosDTO {
    idAvaliacao?: number;
    idEixo?: number;
    idDimensao?: number;
    idUnidade?: number;
    idCurso?: number;
}
