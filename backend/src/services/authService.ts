import jwt from 'jsonwebtoken';
import axios from 'axios';
import https from 'https';
import * as adminRepository from '../repositories/adminRepository';
import { AuthLoginDTO, UserResponseDTO } from '../dtos/AuthDTO';
import { AppError } from '../middleware/errorMiddleware';
import { env, isProduction } from '../config/env';
import { setUniversityToken } from './universityTokenStore';

// Agente HTTPS que ignora certificados (necessário para APIs legadas da UEA)
const httpsAgent = new https.Agent({
    rejectUnauthorized: isProduction && !env.DISABLE_SSL_VALIDATION,
});

type LoginResponseDTO = {
    token: string;
    user: UserResponseDTO;
};

class AuthService {
    private normalizeText(value?: string): string {
        return (value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
    }

    /**
     * Login Real usando as APIs da UEA (Lyceum/Oberon)
     */
    async login(data: AuthLoginDTO): Promise<LoginResponseDTO> {
        const { email, senha } = data;
        const normalizedEmail = email.trim().toLowerCase();
        const lyceumBaseUrl = env.LYCEUM_API_BASE_URL;
        const loginPath = isProduction ? '/lyceum/login' : '/lyceum/loginteste';
        // const loginPath = '/lyceum/login';
        try {
            // 1. Autenticação na API do Lyceum
            const response = await axios.post(
                "https://api.uea.edu.br/lyceum/login",
                // `${lyceumBaseUrl}${loginPath}`,
                { email, senha },
                {
                    headers: { 'Content-Type': 'application/json' },
                    httpsAgent,
                }
            );

            const authData = response.data;

            if (response.status !== 200 || !authData.APILYCEUM || authData.APILYCEUM.status === false) {
                throw new AppError('Falha na autenticação da universidade.', 401);
            }

            const universityToken = authData.APILYCEUM.token;
            if (!universityToken) {
                throw new AppError('Token da universidade não encontrado.', 403);
            }

            // O token da universidade fica apenas em memória no backend para reduzir exposição no cliente.
            setUniversityToken(normalizedEmail, universityToken);

            const usuarioLyceum = authData.APILYCEUM.usuario || {};
            const oberonPerfilNome = usuarioLyceum.OberonPerfilNome || 'DISCENTE';
            const OberonPerfilid = usuarioLyceum.OberonPerfilid;
            const usuarioNome = usuarioLyceum.UsuarioNome || normalizedEmail;
            const cpf = usuarioLyceum.Cpf || undefined;
            let matricula = usuarioLyceum.Matricula || '';
            let unidade = usuarioLyceum.UnidadeNome || '';
            const unidadeSigla = usuarioLyceum.UnidadeSigla || undefined;
            let curso = '';

            const isDiscente = this.normalizeText(oberonPerfilNome).includes('DISCENTE');

            // 2. Complementa dados acadêmicos apenas para perfis com DISCENTE
            if (isDiscente) {
                const alunoResponse = await axios.get(
                    `${lyceumBaseUrl}/lyceum/aluno/listar/matriculapessoal`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${universityToken}`,
                        },
                        httpsAgent,
                    }
                );

                if (alunoResponse.status !== 200 || !alunoResponse.data.status) {
                    throw new AppError('Erro ao obter informações detalhadas do aluno.', 500);
                }

                const alunoData = (alunoResponse.data.message || [])[0] || {};
                curso = alunoData.CURSO || curso;
                unidade = alunoData.UNIDADE_NOME || unidade;
                matricula = alunoData.ALUNO || matricula;
            }

            // 3. Verificar se é Admin no banco local
            const admin = await adminRepository.findByEmail(normalizedEmail);
            const isAdmin = !!admin;
            const role = isAdmin ? 'admin' : 'user';

            const user: UserResponseDTO = {
                // id: 1,
                nome: usuarioNome,
                email: normalizedEmail,
                matricula,
                curso,
                unidade,
                unidadeSigla,
                categoria: oberonPerfilNome || 'DISCENTE',
                oberonPerfilNome,
                OberonPerfilid,
                usuarioNome,
                cpf,
                role,
                isAdmin,
            };

            // 4. Gerar Token JWT do Backend
            const tokenPayload = {
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
            };

            const token = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: '24h' });

            return { token, user };

        } catch (error: any) {
            console.error('Erro no login oficial UEA:', error.message);
            if (error instanceof AppError) throw error;
            throw new AppError('Erro interno ao processar login na universidade.', 500);
        }
    }

    /**
     * Verifica e atualiza os dados do usuário a partir do seu token JWT
     */
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
