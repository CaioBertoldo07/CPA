import * as modalidadesRepository from '../repositories/modalidadesRepository';
import { ModalidadeResponseDTO } from '../dtos/UtilityDTOs';
import { AppError } from '../middleware/errorMiddleware';

class ModalidadesService {
    async getAll(): Promise<ModalidadeResponseDTO[]> {
        const modalidades = await modalidadesRepository.findAll();
        return modalidades.map(m => ({
            ...m,
            isUsed: false // Podemos simplificar ou carregar usage aqui se necessário para a tabela
        })) as ModalidadeResponseDTO[];
    }

    async getById(id: number): Promise<ModalidadeResponseDTO> {
        const modalidade = await modalidadesRepository.findById(id);
        if (!modalidade) throw new AppError('Modalidade não encontrada.', 404);
        
        const usage = await modalidadesRepository.getUsage(id);
        return {
            ...modalidade,
            isUsed: usage.length > 0
        } as ModalidadeResponseDTO;
    }

    async create(data: { mod_ensino: string; mod_oferta?: string }): Promise<ModalidadeResponseDTO> {
        return await modalidadesRepository.create({
            mod_ensino: data.mod_ensino,
            mod_oferta: data.mod_oferta || '',
            num_questoes: 10
        }) as ModalidadeResponseDTO;
    }

    async update(id: number, data: { mod_ensino: string; mod_oferta?: string }): Promise<ModalidadeResponseDTO> {
        const existing = await modalidadesRepository.findById(id);
        if (!existing) throw new AppError('Modalidade não encontrada.', 404);

        const usage = await modalidadesRepository.getUsage(id);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === 1 || s === 2);

            // Se está em uso, cria uma nova (clona) e desativa a antiga
            const newModalidade = await modalidadesRepository.create({
                mod_ensino: data.mod_ensino,
                mod_oferta: data.mod_oferta !== undefined ? data.mod_oferta : existing.mod_oferta,
                num_questoes: existing.num_questoes
            });

            // Só desativa a original se não houver nenhuma avaliação Rascunho ou Ativa usando ela
            if (!hasActiveOrDraft) {
                await modalidadesRepository.update(id, { ativo: false });
            }

            return newModalidade as ModalidadeResponseDTO;
        }

        return await modalidadesRepository.update(id, data) as ModalidadeResponseDTO;
    }

    async delete(id: number): Promise<void> {
        const existing = await modalidadesRepository.findById(id);
        if (!existing) throw new AppError('Modalidade não encontrada.', 404);

        const usage = await modalidadesRepository.getUsage(id);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === 1 || s === 2);

            if (hasActiveOrDraft) {
                throw new AppError('Não é possível excluir esta modalidade pois ela está sendo utilizada em uma avaliação ativa ou rascunho.', 400);
            } else {
                // Apenas desativa (soft delete)
                await modalidadesRepository.update(id, { ativo: false });
            }
        } else {
            // Pode deletar de verdade
            await modalidadesRepository.remove(id);
        }
    }
}

export default new ModalidadesService();
