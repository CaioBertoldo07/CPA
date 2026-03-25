export interface PadraoRespostaResponseDTO {
    id: number;
    sigla: string;
    alternativas: AlternativaResponseDTO[]
}

export interface AlternativaResponseDTO {
    id: number;
    descricao: string;
    id_padrao_resp: number;
}
