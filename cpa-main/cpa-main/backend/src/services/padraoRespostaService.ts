import * as padraoRespostaRepository from '../repositories/padraoRespostaRepository';
import { PadraoRespostaResponseDTO } from '../dtos/PadraoRespostaDTO';
import { AppError } from '../middleware/errorMiddleware';
import { createWithAlternativas } from '../repositories/padraoRespostaRepository';

class PadraoRespostaService {
    async getAll(): Promise<PadraoRespostaResponseDTO[]> {
        return await padraoRespostaRepository.findAll() as PadraoRespostaResponseDTO[];
    }

    async getById(id: number): Promise<PadraoRespostaResponseDTO> {
        const padrao = await padraoRespostaRepository.findById(id);
        if (!padrao) throw new AppError('Padrão de resposta não encontrado.', 404);
        return padrao as PadraoRespostaResponseDTO;
    }

    async create(sigla: string, alternativas: { descricao: string }[]): Promise<PadraoRespostaResponseDTO> {
        console.log('alter: ', alternativas)
        // const alternativasFormatadas = alternativas.map(descricao => ({
        //     descricao
        // }));
    

        return await padraoRespostaRepository.createWithAlternativas(
            sigla,
            alternativas
        ) as PadraoRespostaResponseDTO;
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
