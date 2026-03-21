import jwt from 'jsonwebtoken';
import * as adminRepository from '../repositories/adminRepository';
import { AuthLoginDTO, UserResponseDTO } from '../dtos/AuthDTO';
import { AppError } from '../middleware/errorMiddleware';

class AuthService {
    async loginDev(data: AuthLoginDTO): Promise<{ token: string; user: any }> {
        const { email } = data;
        let role = 'user';

        if (email === 'admin@uea.edu.br') {
            role = 'admin';
        } else {
            const admin = await adminRepository.findByEmail(email);
            if (admin) role = 'admin';
        }

        const user = {
            id: 1,
            nome: 'Usuário Dev',
            email: email,
            matricula: '1234567',
            curso: 'CURSO_DEV',
            unidade: 'UNIDADE_DEV',
            categoria: 'DISCENTE',
            oberonPerfilNome: 'DISCENTE',
            role,
            universityToken: 'dev-token',
        };

        const token = jwt.sign(user, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        return { token, user };
    }

    async verifyUser(user: any): Promise<UserResponseDTO> {
        let role = 'user';
        const admin = await adminRepository.findByEmail(user.email);
        if (admin) role = 'admin';

        return {
            ...user,
            role,
        };
    }
}

export default new AuthService();
