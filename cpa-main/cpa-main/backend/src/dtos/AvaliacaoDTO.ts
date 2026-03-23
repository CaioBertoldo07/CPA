export interface AvaliacaoResponseDTO {
    id: number;
    periodo_letivo: string;
    data_inicio: Date;
    data_fim: Date;
    status: number;
    ano: string;
    titulo?: string;
    unidade?: any[];
    cursos?: any[];
    categorias?: any[];
    modalidades?: any[];
    avaliacao_questoes?: any[];
    questoes?: any[];
}

export interface CreateAvaliacaoDTO {
    unidade: number[];
    cursos: string[]; // identificador_api_lyceum
    categorias: number[];
    modalidade: number[];
    questoes: number[];
    periodo_letivo: string;
    data_inicio: string;
    data_fim: string;
    status: number;
    ano: string;
}
