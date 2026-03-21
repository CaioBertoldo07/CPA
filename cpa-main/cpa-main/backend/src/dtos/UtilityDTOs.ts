export interface MunicipioResponseDTO {
    id: number;
    nome: string;
}

export interface UnidadeResponseDTO {
    id: number;
    nome: string;
    sigla: string;
    municipio_vinculo: string;
}

export interface CategoriaResponseDTO {
    id: number;
    nome: string;
}

export interface ModalidadeResponseDTO {
    id: number;
    mod_ensino: string;
    mod_oferta?: string;
    num_questoes?: number;
}
