import * as padraoRespostaRepository from '../repositories/padraoRespostaRepository';
import { PadraoRespostaResponseDTO } from '../dtos/PadraoRespostaDTO';
import { AppError } from '../middleware/errorMiddleware';

class PadraoRespostaService {
    async getAll(): Promise<PadraoRespostaResponseDTO[]> {
        return await padraoRespostaRepository.findAll() as PadraoRespostaResponseDTO[];
    }

    async getById(id: number): Promise<PadraoRespostaResponseDTO> {
        const padrao = await padraoRespostaRepository.findById(id);
        if (!padrao) throw new AppError('Padrão de resposta não encontrado.', 404);
        return padrao as PadraoRespostaResponseDTO;
    }

    async create(sigla: string): Promise<PadraoRespostaResponseDTO> {
        return await padraoRespostaRepository.create({ sigla }) as PadraoRespostaResponseDTO;
    }

    async update(id: number, sigla: string): Promise<PadraoRespostaResponseDTO> {
        const existing = await padraoRespostaRepository.findById(id);
        if (!existing) throw new AppError('Padrão de resposta não encontrado para atualizar.', 404);
        return await padraoRespostaRepository.update(id, { sigla }) as PadraoRespostaResponseDTO;
    }

    async delete(id: number): Promise<void> {
        const existing = await padraoRespostaRepository.findById(id);
        if (!existing) throw new AppError('Padrão de resposta não encontrado.', 404);
        await padraoRespostaRepository.remove(id);
    }
}

export default new PadraoRespostaService();
