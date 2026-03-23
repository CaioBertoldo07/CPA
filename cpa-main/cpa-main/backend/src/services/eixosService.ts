import * as eixosRepository from '../repositories/eixosRepository';
import * as dimensoesRepository from '../repositories/dimensoesRepository';
import { EixoResponseDTO, CreateEixoDTO } from '../dtos/EixoDTO';
import { AppError } from '../middleware/errorMiddleware';
import prisma from '../repositories/prismaClient';

class EixosService {
    async getAll(): Promise<EixoResponseDTO[]> {
        return await eixosRepository.findAll() as EixoResponseDTO[];
    }

    async getByNumero(numero: number): Promise<EixoResponseDTO> {
        const eixo = await eixosRepository.findByNumero(numero);
        if (!eixo) throw new AppError('Eixo não encontrado.', 404);
        return eixo as EixoResponseDTO;
    }

    async create(data: CreateEixoDTO): Promise<void> {
        const { numero, nome, dimensoes } = data;

        const eixoExists = await eixosRepository.findByNumero(numero);
        if (eixoExists) throw new AppError('Eixo já existe.', 400);

        for (const dimensao of dimensoes) {
            const dimensaoExists = await dimensoesRepository.findByNumero(dimensao.numero);
            if (dimensaoExists) throw new AppError(`Dimensão ${dimensao.numero} já existe.`, 400);
        }

        await eixosRepository.createWithDimensoes(numero, nome, dimensoes);
    }

    async update(numero: number, nome: string): Promise<void> {
        const eixoExists = await eixosRepository.findByNumero(numero);
        if (!eixoExists) throw new AppError('Eixo não encontrado.', 404);

        await eixosRepository.update(numero, { nome });
    }

    async delete(numero: number): Promise<void> {
        const eixoExists = await eixosRepository.findByNumero(numero);
        if (!eixoExists) throw new AppError('Eixo não encontrado.', 404);

        await prisma.$transaction([
            prisma.dimensoes.deleteMany({ where: { numero_eixos: numero } }),
            prisma.eixos.delete({ where: { numero } })
        ]);
    }
}

export default new EixosService();
