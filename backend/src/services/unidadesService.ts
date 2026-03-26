import * as unidadesRepository from '../repositories/unidadesRepository';
import { UnidadeResponseDTO } from '../dtos/UtilityDTOs';
import { AppError } from '../middleware/errorMiddleware';

class UnidadesService {
    async getAll(): Promise<UnidadeResponseDTO[]> {
        return await unidadesRepository.findAll() as UnidadeResponseDTO[];
    }

    async getById(id: number): Promise<UnidadeResponseDTO> {
        const unidade = await unidadesRepository.findById(id);
        if (!unidade) throw new AppError('Unidade não encontrada.', 404);
        return unidade as UnidadeResponseDTO;
    }

    async getByMunicipios(municipios: string[]): Promise<UnidadeResponseDTO[]> {
        return await unidadesRepository.findByMunicipios(municipios) as UnidadeResponseDTO[];
    }
}

export default new UnidadesService();
