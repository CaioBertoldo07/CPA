import * as adminRepository from '../repositories/adminRepository';
import { AdminResponseDTO } from '../dtos/AuthDTO';
import { AppError } from '../middleware/errorMiddleware';

class AdminService {
    async getAll(): Promise<AdminResponseDTO[]> {
        return await adminRepository.findAll() as AdminResponseDTO[];
    }

    async create(data: { email: string; nome: string }): Promise<AdminResponseDTO> {
        return await adminRepository.create(data) as AdminResponseDTO;
    }

    async delete(email: string): Promise<void> {
        const admin = await adminRepository.findByEmail(email);
        if (!admin) throw new AppError('Administrador não encontrado.', 404);
        await adminRepository.remove(admin.id);
    }
}

export default new AdminService();
