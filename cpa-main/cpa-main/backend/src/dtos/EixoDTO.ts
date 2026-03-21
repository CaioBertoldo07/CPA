export interface EixoResponseDTO {
    numero: number;
    nome: string;
    dimensoes?: DimensoesResponseDTO[];
}

export interface CreateEixoDTO {
    numero: number;
    nome: string;
    dimensoes: Array<{
        numero: number;
        nome: string;
    }>;
}

export interface DimensoesResponseDTO {
    numero: number;
    nome: string;
    numero_eixos: number;
}
