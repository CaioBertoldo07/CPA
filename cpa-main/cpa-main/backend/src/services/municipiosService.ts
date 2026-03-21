import * as municipiosRepository from '../repositories/municipiosRepository';
import { MunicipioResponseDTO } from '../dtos/UtilityDTOs';
import { AppError } from '../middleware/errorMiddleware';

class MunicipiosService {
    async getAll(): Promise<MunicipioResponseDTO[]> {
        return await municipiosRepository.findAll() as MunicipioResponseDTO[];
    }

    async getById(id: number): Promise<MunicipioResponseDTO> {
        const municipio = await municipiosRepository.findById(id);
        if (!municipio) throw new AppError('Município não encontrado.', 404);
        return municipio as MunicipioResponseDTO;
    }
}

export default new MunicipiosService();
