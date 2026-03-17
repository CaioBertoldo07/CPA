interface UnidadeCursosResponse {
    INDICE: Indice;
    UNIDADECURSOS: UnidadeCurso[];
}

interface Indice {
    DATA: string;  // Date as string in 'dd-MM-yyyy' format
    HORA: string;  // Time as string
    IP: string;
    TUPLAS: number;  // Number of tuples (records)
}

interface UnidadeCurso {
    CURSO: string;
    MNEMONICO: string;
    NOME: string;
    TITULO: string;
    FORMATURA: string;
    TIPO: string;
    MODALIDADE: string;
    CURSO_COD: string;
    CURSO_NOME: string | null;  // Nullable field
    CURSO_TIPO: string;
    NOME_COMP: string;
    NOME_ABREV: string;
    MUNICIPIO_NOME: string;
    MUNICIPIO_UF: string;  // 2-character state code
}

export default UnidadeCursosResponse;
