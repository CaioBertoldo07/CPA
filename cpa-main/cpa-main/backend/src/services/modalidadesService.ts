import * as modalidadesRepository from '../repositories/modalidadesRepository';
import { ModalidadeResponseDTO } from '../dtos/UtilityDTOs';
import { AppError } from '../middleware/errorMiddleware';

class ModalidadesService {
    async getAll(): Promise<ModalidadeResponseDTO[]> {
        return await modalidadesRepository.findAll() as ModalidadeResponseDTO[];
    }

    async getById(id: number): Promise<ModalidadeResponseDTO> {
        const modalidade = await modalidadesRepository.findById(id);
        if (!modalidade) throw new AppError('Modalidade não encontrada.', 404);
        return modalidade as ModalidadeResponseDTO;
    }

    async create(data: { mod_ensino: string; mod_oferta?: string }): Promise<ModalidadeResponseDTO> {
        return await modalidadesRepository.create({
            mod_ensino: data.mod_ensino,
            mod_oferta: data.mod_oferta || '',
            num_questoes: 10
        }) as ModalidadeResponseDTO;
    }

    async update(id: number, data: { mod_ensino: string; mod_oferta?: string }): Promise<ModalidadeResponseDTO> {
        const existing = await modalidadesRepository.findById(id);
        if (!existing) throw new AppError('Modalidade não encontrada.', 404);
        return await modalidadesRepository.update(id, data) as ModalidadeResponseDTO;
    }

    async delete(id: number): Promise<void> {
        const existing = await modalidadesRepository.findById(id);
        if (!existing) throw new AppError('Modalidade não encontrada.', 404);
        await modalidadesRepository.remove(id);
    }
}

export default new ModalidadesService();
