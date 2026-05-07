export interface PadraoRespostaResponseDTO {
    id: number;
    sigla: string;
    alternativas: AlternativaResponseDTO[];
    ativo?: boolean;
    isUsed?: boolean;
}

export interface AlternativaResponseDTO {
    id: number;
    descricao: string;
    id_padrao_resp: number;
    ativo?: boolean;
    isUsed?: boolean;
}
