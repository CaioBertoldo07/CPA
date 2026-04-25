import * as eixosRepository from '../repositories/eixosRepository';
import * as dimensoesRepository from '../repositories/dimensoesRepository';
import { EixoResponseDTO, CreateEixoDTO } from '../dtos/EixoDTO';
import { AppError } from '../middleware/errorMiddleware';
import prisma from '../repositories/prismaClient';

class EixosService {
    async getAll(): Promise<EixoResponseDTO[]> {
        const eixos = await eixosRepository.findAll();
        return eixos.map(e => ({
            ...e,
            isUsed: false
        })) as EixoResponseDTO[];
    }

    async getByNumero(numero: number): Promise<EixoResponseDTO> {
        const eixo = await eixosRepository.findByNumero(numero);
        if (!eixo) throw new AppError('Eixo não encontrado.', 404);
        
        const usage = await eixosRepository.getUsage(numero);
        return {
            ...eixo,
            isUsed: usage.length > 0
        } as EixoResponseDTO;
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

        const usage = await eixosRepository.getUsage(numero);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === 1 || s === 2);
            if (hasActiveOrDraft) {
                throw new AppError('Não é possível editar este eixo pois ele está sendo utilizado em uma avaliação ativa ou rascunho.', 400);
            }
            // Diferente de questões, eixos e dimensões possuem IDs fixos (numero).
            // Aqui permitimos editar o nome se já for encerrada, mas não clonamos pois o número é a PK.
        }

        await eixosRepository.update(numero, { nome });
    }

    async delete(numero: number): Promise<void> {
        const eixoExists = await eixosRepository.findByNumero(numero);
        if (!eixoExists) throw new AppError('Eixo não encontrado.', 404);

        const usage = await eixosRepository.getUsage(numero);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === 1 || s === 2);
            if (hasActiveOrDraft) {
                throw new AppError('Não é possível excluir este eixo pois ele está sendo utilizado em uma avaliação ativa ou rascunho.', 400);
            } else {
                // Soft delete inclusive nas dimensões vinculadas
                await prisma.$transaction([
                    prisma.eixos.update({ where: { numero }, data: { ativo: false } }),
                    prisma.dimensoes.updateMany({ where: { numero_eixos: numero }, data: { ativo: false } })
                ]);
            }
        } else {
            // Hard delete
            await prisma.$transaction([
                prisma.dimensoes.deleteMany({ where: { numero_eixos: numero } }),
                prisma.eixos.delete({ where: { numero } })
            ]);
        }
    }

}

export default new EixosService();
