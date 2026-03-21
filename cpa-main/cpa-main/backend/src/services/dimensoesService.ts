import * as dimensoesRepository from '../repositories/dimensoesRepository';
import * as eixosRepository from '../repositories/eixosRepository';
import { DimensoesResponseDTO } from '../dtos/EixoDTO';
import { AppError } from '../middleware/errorMiddleware';

class DimensoesService {
    async getAll(): Promise<DimensoesResponseDTO[]> {
        return await dimensoesRepository.findAll() as DimensoesResponseDTO[];
    }

    async getByNumero(numero: number): Promise<DimensoesResponseDTO> {
        const dimensao = await dimensoesRepository.findByNumero(numero);
        if (!dimensao) throw new AppError('Dimensão não encontrada.', 404);
        return dimensao as DimensoesResponseDTO;
    }

    async getByEixo(numeroEixo: number): Promise<DimensoesResponseDTO[]> {
        return await dimensoesRepository.findByEixo(numeroEixo) as DimensoesResponseDTO[];
    }

    async create(data: { numero: number; nome: string; numero_eixos: number }): Promise<DimensoesResponseDTO> {
        const { numero, nome, numero_eixos } = data;

        const eixoExists = await eixosRepository.findByNumero(numero_eixos);
        if (!eixoExists) throw new AppError('Número de eixo fornecido não existe.', 400);

        const dimensaoExists = await dimensoesRepository.findByNumero(numero);
        if (dimensaoExists) throw new AppError('Dimensão já existe.', 400);

        return await dimensoesRepository.create({
            numero,
            nome,
            eixos: { connect: { numero: numero_eixos } }
        }) as DimensoesResponseDTO;
    }

    async update(numero: number, data: { novoNumero: number; nome: string; numero_eixos: number }): Promise<DimensoesResponseDTO> {
        const { novoNumero, nome, numero_eixos } = data;

        const dimensaoExists = await dimensoesRepository.findByNumero(numero);
        if (!dimensaoExists) throw new AppError('Dimensão não encontrada para atualizar.', 404);

        const eixoExists = await eixosRepository.findByNumero(numero_eixos);
        if (!eixoExists) throw new AppError('Número de eixo fornecido não existe.', 400);

        return await dimensoesRepository.update(numero, {
            numero: novoNumero,
            nome,
            eixos: { connect: { numero: numero_eixos } }
        }) as DimensoesResponseDTO;
    }

    async delete(numero: number): Promise<void> {
        const dimensaoExists = await dimensoesRepository.findByNumero(numero);
        if (!dimensaoExists) throw new AppError('Dimensão não encontrada.', 404);

        await dimensoesRepository.remove(numero);
    }
}

export default new DimensoesService();
