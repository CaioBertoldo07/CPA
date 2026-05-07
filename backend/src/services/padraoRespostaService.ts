import * as padraoRespostaRepository from '../repositories/padraoRespostaRepository';
import { PadraoRespostaResponseDTO } from '../dtos/PadraoRespostaDTO';
import { AppError } from '../middleware/errorMiddleware';
import prisma from '../repositories/prismaClient';
import { AVALIACAO_STATUS } from '../utils/avaliacaoStatus';

class PadraoRespostaService {
    async getAll(): Promise<PadraoRespostaResponseDTO[]> {
        const padroes = await padraoRespostaRepository.findAll();
        return padroes as PadraoRespostaResponseDTO[];
    }

    async getById(id: number): Promise<PadraoRespostaResponseDTO> {
        const padrao = await padraoRespostaRepository.findById(id);
        if (!padrao) throw new AppError('Padrão de resposta não encontrado.', 404);
        
        const usage = await padraoRespostaRepository.getUsage(id);
        return {
            ...padrao,
            isUsed: usage.length > 0
        } as PadraoRespostaResponseDTO;
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

    async update(id: number, sigla: string, alternativas?: { descricao: string }[]): Promise<PadraoRespostaResponseDTO> {
        const existing = await padraoRespostaRepository.findById(id);
        if (!existing) throw new AppError('Padrão de resposta não encontrado para atualizar.', 404);

        const usage = await padraoRespostaRepository.getUsage(id);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === AVALIACAO_STATUS.RASCUNHO || s === AVALIACAO_STATUS.ATIVA);

            // Se está em uso, cria um novo (clona) e desativa o antigo
            // Usa as novas alternativas se fornecidas, senão as existentes
            const alternativasParaClonar = alternativas || existing.alternativas.map((a: any) => ({ descricao: a.descricao }));
            
            const newPadrao = await padraoRespostaRepository.createWithAlternativas(
                sigla,
                alternativasParaClonar
            );

            // Só desativa o original se não houver nenhuma avaliação Rascunho ou Ativa usando ele
            if (!hasActiveOrDraft) {
                await padraoRespostaRepository.update(id, { ativo: false });
                // Também desativa as alternativas antigas? No schema a relação é Many-to-One
                // Alternativas pertencem a um padrão. Ao desativar o padrão, as alternativas
                // vinculadas a ele deixam de ser "visíveis" via consultas do padrão.
            }

            return newPadrao as PadraoRespostaResponseDTO;
        }

        // Se não estiver em uso e houver alternativas novas, precisamos atualizar as alternativas também
        if (alternativas) {
            const alternativasFiltradas = alternativas.filter(a => a.descricao && a.descricao.trim());
            await prisma.$transaction(async (tx) => {
                await tx.alternativas.deleteMany({ where: { id_padrao_resp: id } });
                await tx.padrao_resposta.update({
                    where: { id },
                    data: {
                        sigla,
                        alternativas: {
                            create: alternativasFiltradas.map(a => ({ descricao: a.descricao }))
                        }
                    }
                });
            });
            return await padraoRespostaRepository.findById(id) as PadraoRespostaResponseDTO;
        }

        return await padraoRespostaRepository.update(id, { sigla }) as PadraoRespostaResponseDTO;
    }

    async delete(id: number): Promise<void> {
        const existing = await padraoRespostaRepository.findById(id);
        if (!existing) throw new AppError('Padrão de resposta não encontrado.', 404);

        const usage = await padraoRespostaRepository.getUsage(id);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === AVALIACAO_STATUS.RASCUNHO || s === AVALIACAO_STATUS.ATIVA);

            if (hasActiveOrDraft) {
                throw new AppError('Não é possível excluir este padrão de resposta pois ele está sendo utilizado em uma avaliação ativa ou rascunho.', 400);
            } else {
                // Soft delete cascading to alternativas
                await prisma.$transaction(async (tx) => {
                    await tx.alternativas.updateMany({
                        where: { id_padrao_resp: id },
                        data: { ativo: false }
                    });
                    await tx.padrao_resposta.update({
                        where: { id },
                        data: { ativo: false }
                    });
                });
            }
        } else {
            // Hard delete
            await prisma.$transaction(async (tx) => {
                await tx.alternativas.deleteMany({ where: { id_padrao_resp: id } });
                await tx.padrao_resposta.delete({ where: { id } });
            });
        }
    }

}

export default new PadraoRespostaService();
