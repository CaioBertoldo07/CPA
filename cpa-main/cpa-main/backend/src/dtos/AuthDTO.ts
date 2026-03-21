export interface AdminResponseDTO {
    email: string;
    nome: string;
}

export interface AuthLoginDTO {
    email: string;
    senha?: string;
}

export interface UserResponseDTO {
    id: number;
    matricula: string;
    nome: string;
    email: string;
    curso: string;
    unidade: string;
    categoria: string;
    oberonPerfilNome: string;
    token: string;
    universityToken: string;
}
