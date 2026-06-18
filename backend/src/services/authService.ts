import jwt from 'jsonwebtoken';
import * as adminRepository from '../repositories/adminRepository';
import { AuthLoginDTO, UserResponseDTO } from '../dtos/AuthDTO';
import { AppError } from '../middleware/errorMiddleware';
import { env } from '../config/env';
import { setUniversityToken } from './universityTokenStore';
import LyceumService from './lyceumService';

const lyceumService = new LyceumService();

type LoginResponseDTO = {
    token: string;
    user: UserResponseDTO;
};

class AuthService {
    private normalizeText(value?: string): string {
        return (value || '')
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toUpperCase();
    }

    async login(data: AuthLoginDTO): Promise<LoginResponseDTO> {
        const { email, senha } = data;
        const normalizedEmail = email.trim().toLowerCase();

        try {
            // 1. Autenticação via LyceumService
            const apiLyceum = await lyceumService.loginUser(email, senha);

            const universityToken = apiLyceum.token;
            if (!universityToken) {
                throw new AppError('Token da universidade não encontrado.', 403);
            }

            // Token universitário fica apenas em memória no backend.
            setUniversityToken(normalizedEmail, universityToken);

            const usuarioLyceum = (apiLyceum.usuario ?? {}) as Record<string, unknown>;
            const oberonPerfilNome = String(usuarioLyceum.OberonPerfilNome ?? 'DISCENTE');
            const OberonPerfilid = usuarioLyceum.OberonPerfilid as string | number | undefined;
            const usuarioNome = String(usuarioLyceum.UsuarioNome ?? normalizedEmail);
            const cpf = usuarioLyceum.Cpf ? String(usuarioLyceum.Cpf) : undefined;
            let matricula = String(usuarioLyceum.Matricula ?? '');
            let unidade = String(usuarioLyceum.UnidadeNome ?? '');
            const unidadeSigla = usuarioLyceum.UnidadeSigla
                ? String(usuarioLyceum.UnidadeSigla)
                : undefined;
            let curso = '';

            const isDiscente = this.normalizeText(oberonPerfilNome).includes('DISCENTE');

            // 2. Complementa dados acadêmicos para discentes via LyceumService
            if (isDiscente) {
                const alunoData = await lyceumService.getAlunoMatricula(universityToken);
                curso = String(alunoData.CURSO ?? curso);
                unidade = String(alunoData.UNIDADE_NOME ?? unidade);
                matricula = String(alunoData.ALUNO ?? matricula);
            }

            // 3. Verifica se é Admin no banco local
            const admin = await adminRepository.findByEmail(normalizedEmail);
            const isAdmin = !!admin;
            const role = isAdmin ? 'admin' : 'user';

            const user: UserResponseDTO = {
                nome: usuarioNome,
                email: normalizedEmail,
                matricula,
                curso,
                unidade,
                unidadeSigla,
                categoria: oberonPerfilNome,
                oberonPerfilNome,
                OberonPerfilid,
                usuarioNome,
                cpf,
                role,
                isAdmin,
            };

            // 4. Gera Token JWT do backend
            const token = jwt.sign(
                {
                    nome: user.nome,
                    email: user.email,
                    matricula: user.matricula,
                    curso: user.curso,
                    unidade: user.unidade,
                    unidadeSigla: user.unidadeSigla,
                    categoria: user.categoria,
                    oberonPerfilNome: user.oberonPerfilNome,
                    oberonPerfilId: user.OberonPerfilid,
                    usuarioNome: user.usuarioNome,
                    cpf: user.cpf,
                    role: user.role,
                    isAdmin: user.isAdmin,
                },
                env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return { token, user };

        } catch (error: unknown) {
            if (error instanceof AppError) throw error;
            const msg = error instanceof Error ? error.message : String(error);
            console.error('[AuthService] Erro no login UEA:', msg);
            throw new AppError('Erro interno ao processar login na universidade.', 500);
        }
    }

    async verifyUser(user: any): Promise<UserResponseDTO> {
        const admin = await adminRepository.findByEmail(user.email.trim().toLowerCase());
        const isAdmin = !!admin;
        const role = isAdmin ? 'admin' : 'user';

        return {
            ...user,
            role,
            isAdmin,
            categoria: user.categoria || user.oberonPerfilNome || 'DISCENTE',
            oberonPerfilNome: user.oberonPerfilNome || 'DISCENTE',
        };
    }
}

export default new AuthService();
