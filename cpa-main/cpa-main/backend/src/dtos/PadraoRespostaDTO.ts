export interface PadraoRespostaResponseDTO {
    id: number;
    sigla: string;
}

export interface AlternativaResponseDTO {
    id: number;
    descricao: string;
    id_padrao_resp: number;
}
