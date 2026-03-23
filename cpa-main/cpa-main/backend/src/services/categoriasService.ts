import * as categoriasRepository from '../repositories/categoriasRepository';
import { CategoriaResponseDTO } from '../dtos/UtilityDTOs';
import { AppError } from '../middleware/errorMiddleware';

class CategoriasService {
    async getAll(): Promise<CategoriaResponseDTO[]> {
        return await categoriasRepository.findAll() as CategoriaResponseDTO[];
    }

    async create(nome: string): Promise<CategoriaResponseDTO> {
        return await categoriasRepository.create({ nome }) as CategoriaResponseDTO;
    }

    async update(id: number, nome: string): Promise<CategoriaResponseDTO> {
        const existing = await categoriasRepository.findById(id);
        if (!existing) throw new AppError('Categoria não encontrada.', 404);
        return await categoriasRepository.update(id, { nome }) as CategoriaResponseDTO;
    }

    async delete(id: number): Promise<void> {
        const existing = await categoriasRepository.findById(id);
        if (!existing) throw new AppError('Categoria não encontrada.', 404);
        await categoriasRepository.remove(id);
    }
}

export default new CategoriasService();
