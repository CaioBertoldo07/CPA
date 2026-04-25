export interface AdminResponseDTO {
    email: string;
    nome: string;
}

export interface AuthLoginDTO {
    email: string;
    senha?: string;
}

export interface UserResponseDTO {
    // id: number;
    matricula: string;
    nome: string;
    email: string;
    curso: string;
    unidade: string;
    unidadeSigla?: string;
    categoria: string;
    oberonPerfilNome: string;
    OberonPerfilid?: string | number;
    usuarioNome: string;
    cpf?: string;
    universityToken?: string;
    role: string;
    isAdmin: boolean;
}
