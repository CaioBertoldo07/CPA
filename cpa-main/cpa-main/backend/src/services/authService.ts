import jwt from 'jsonwebtoken';
import axios from 'axios';
import https from 'https';
import * as adminRepository from '../repositories/adminRepository';
import { AuthLoginDTO, UserResponseDTO } from '../dtos/AuthDTO';
import { AppError } from '../middleware/errorMiddleware';

// Configurações de Permissões
const PERMISSIONS = {
    admin: ['read:eixos', 'read:dimensoes', 'write:eixos', 'write:dimensoes', 'admin'],
    aluno: ['read:eixos', 'read:dimensoes', 'read:modalidades'],
};

// Agente HTTPS que ignora certificados (necessário para APIs legadas da UEA)
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

class AuthService {
    /**
     * Login Real usando as APIs da UEA (Lyceum/Oberon)
     */
    async login(data: AuthLoginDTO): Promise<{ token: string; user: UserResponseDTO; isAdmin: boolean }> {
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
            const usuarioNome = authData.APILYCEUM.usuario.UsuarioNome;

            // 3. Verificar se é Admin no banco local
            const admin = await adminRepository.findByEmail(normalizedEmail);
            const isAdmin = !!admin;
            const role = isAdmin ? 'admin' : 'user';
            const permissions = isAdmin ? PERMISSIONS.admin : PERMISSIONS.aluno;

            const user: UserResponseDTO = {
                // id: 1,
                nome: usuarioNome,
                email: normalizedEmail,
                matricula,
                curso,
                unidade,
                categoria: isAdmin ? 'ADMIN' : 'DISCENTE',
                oberonPerfilNome,
                usuarioNome,
                role,
                isAdmin,
                permissions,
                universityToken,
                token: '',
            };

            // 4. Gerar Token JWT do Backend
            const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY || 'secret';
            const token = jwt.sign(user, jwtSecret, { expiresIn: '24h' });
            user.token = token;

            return { token, user, isAdmin };

        } catch (error: any) {
            console.error('Erro no login oficial UEA:', error.message);
            if (error instanceof AppError) throw error;
            throw new AppError('Erro interno ao processar login na universidade.', 500);
        }
    }

    /**
     * Login de Desenvolvimento (Falso) para testes rápidos
     */
    async loginDev(data: AuthLoginDTO): Promise<{ token: string; user: UserResponseDTO; isAdmin: boolean }> {
        const { email } = data;
        const normalizedEmail = email.trim().toLowerCase();

        const admin = await adminRepository.findByEmail(normalizedEmail);
        const isAdmin = !!admin;
        const role = isAdmin ? 'admin' : 'user';
        const permissions = isAdmin ? PERMISSIONS.admin : PERMISSIONS.aluno;

        const user: UserResponseDTO = {
            // id: 1,
            nome: isAdmin ? 'Administrador' : 'Usuário Dev',
            email: normalizedEmail,
            matricula: '1234567',
            curso: 'CURSO_TESTE', // Usando TESTE em vez de DEV para ficar mais claro
            unidade: 'UNIDADE_TESTE',
            categoria: isAdmin ? 'ADMIN' : 'DISCENTE',
            oberonPerfilNome: isAdmin ? 'ADMIN' : 'DISCENTE',
            usuarioNome: normalizedEmail.split('@')[0],
            role,
            isAdmin,
            permissions,
            universityToken: 'fake-token-dev',
            token: '',
        };

        const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY || 'secret';
        const token = jwt.sign(user, jwtSecret, { expiresIn: '24h' });
        user.token = token;

        return { token, user, isAdmin };
    }

    /**
     * Verifica e atualiza os dados do usuário a partir do seu token JWT
     */
    async verifyUser(user: any): Promise<UserResponseDTO> {
        const admin = await adminRepository.findByEmail(user.email.trim().toLowerCase());
        const isAdmin = !!admin;
        const role = isAdmin ? 'admin' : 'user';
        const permissions = isAdmin ? PERMISSIONS.admin : PERMISSIONS.aluno;

        return {
            ...user,
            role,
            isAdmin,
            permissions,
            categoria: isAdmin ? 'ADMIN' : (user.categoria || 'DISCENTE'),
            oberonPerfilNome: isAdmin ? 'ADMIN' : (user.oberonPerfilNome || 'DISCENTE'),
        };
    }
}

export default new AuthService();
