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
    /**
     * Login Real usando as APIs da UEA (Lyceum/Oberon)
     */
    async login(data: AuthLoginDTO): Promise<LoginResponseDTO> {
        const { email, senha } = data;
        const normalizedEmail = email.trim().toLowerCase();

        try {
            // 1. Autenticação na API do Lyceum
            const response = await axios.post(
                'https://api.uea.edu.br/lyceum/login',
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

            // 2. Obter informações de matrícula/curso
            const alunoResponse = await axios.get(
                'https://api-carteira.uea.edu.br/lyceum/cadu/aluno/matriculapessoal',
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

            const alunoData = alunoResponse.data.message[0];
            const curso = alunoData.CURSO;
            const unidade = alunoData.UNIDADE_NOME;
            const matricula = alunoData.ALUNO;
            const oberonPerfilNome = authData.APILYCEUM.usuario.OberonPerfilNome;
            const OberonPerfilid = authData.APILYCEUM.usuario.OberonPerfilid;
            const usuarioNome = authData.APILYCEUM.usuario.UsuarioNome;

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
                categoria: oberonPerfilNome || 'DISCENTE',
                oberonPerfilNome,
                OberonPerfilid,
                usuarioNome,
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
                categoria: user.categoria,
                oberonPerfilNome: user.oberonPerfilNome,
                oberonPerfilId: user.OberonPerfilid,
                usuarioNome: user.usuarioNome,
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
            categoria: user.categoria || 'DISCENTE',
            oberonPerfilNome: user.oberonPerfilNome || 'DISCENTE',
        };
    }
}

export default new AuthService();
