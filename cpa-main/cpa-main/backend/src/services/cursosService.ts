import * as cursosRepository from '../repositories/cursosRepository';
import { CursoResponseDTO } from '../dtos/CursoDTO';
import { AppError } from '../middleware/errorMiddleware';

class CursosService {
    async getAll(): Promise<CursoResponseDTO[]> {
        return await cursosRepository.findAll() as CursoResponseDTO[];
    }

    async getByModalidades(modalidadeIds: string[]): Promise<CursoResponseDTO[]> {
        return await cursosRepository.findByModalidades(modalidadeIds) as CursoResponseDTO[];
    }

    async getByUnidades(unidadeIds: number[]): Promise<CursoResponseDTO[]> {
        return await cursosRepository.findByUnidades(unidadeIds) as CursoResponseDTO[];
    }
}

export default new CursosService();
