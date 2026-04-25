import * as padraoRespostaRepository from '../repositories/padraoRespostaRepository';
import { PadraoRespostaResponseDTO } from '../dtos/PadraoRespostaDTO';
import { AppError } from '../middleware/errorMiddleware';
import prisma from '../repositories/prismaClient';

class PadraoRespostaService {
    async getAll(): Promise<PadraoRespostaResponseDTO[]> {
        const padroes = await padraoRespostaRepository.findAll();
        return padroes.map(p => ({
            ...p,
            isUsed: false
        })) as PadraoRespostaResponseDTO[];
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
            const hasActiveOrDraft = usage.some(s => s === 1 || s === 2);

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
        // Nota: O método update abaixo só atualiza a sigla. Se houver alternativas, precisaríamos
        // de um método de repositório mais completo ou fazer manual aqui.
        if (alternativas) {
             // Como é um update simples (sem uso prévio), podemos deletar as antigas e criar novas
             await prisma.alternativas.deleteMany({ where: { id_padrao_resp: id } });
             await padraoRespostaRepository.update(id, {
                 sigla,
                 alternativas: {
                     create: alternativas.map(a => ({ descricao: a.descricao }))
                 }
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
            const hasActiveOrDraft = usage.some(s => s === 1 || s === 2);

            if (hasActiveOrDraft) {
                throw new AppError('Não é possível excluir este padrão de resposta pois ele está sendo utilizado em uma avaliação ativa ou rascunho.', 400);
            } else {
                // Soft delete
                await padraoRespostaRepository.update(id, { ativo: false });
            }
        } else {
            // Hard delete
            // Temos que deletar as alternativas antes se não houver cascade no BD
            await prisma.alternativas.deleteMany({ where: { id_padrao_resp: id } });
            await padraoRespostaRepository.remove(id);
        }
    }

}

export default new PadraoRespostaService();
