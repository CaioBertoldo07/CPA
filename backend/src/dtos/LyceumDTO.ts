export interface LyceumCursoDTO {
    CURSO: string;
    NOME: string;
    MUNICIPIO_NOME: string;
    MUNICIPIO_UF: string;
    NOME_COMP: string;
    NOME_ABREV: string;
    TIPO: string;
    MODALIDADE: string;
    CURSO_TIPO: string;
}

// Retorno de Lyceum POST /matriculados/listar/filtro (uma linha por curso/unidade/periodo).
export interface LyceumMatriculadoDTO {
    UND: string;
    UND_TIPO: string;
    UND_MUNICIPIO: string;
    ANO: string;
    SEMESTRE: string;
    CURSO: string;        // codigo (ex: "CESI02IBD") = Cursos.identificador_api_lyceum
    CURSO_TIPO: string;
    CURSO_NOME: string;
    QT_MATRICULA: string; // total de matriculados (vem como string)
}

// Filtro aceito por POST /matriculados/listar/filtro (ano e obrigatorio).
export interface LyceumMatriculadosFiltro {
    ano: string;
    semestre?: string;
    und?: string;
    und_tipo?: string;
    und_municipio?: string;
    curso?: string;
    curso_tipo?: string;
    curso_nome?: string;
}

interface LyceumEnvelope<T> {
    DADOS?: T[];
    INDICE?: { TUPLAS_RETORNADAS?: number;[k: string]: unknown };
}

export type LyceumMatriculadosResponse = LyceumEnvelope<LyceumMatriculadoDTO>;
