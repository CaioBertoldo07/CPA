import * as alternativasRepository from '../repositories/alternativasRepository';
import * as padraoRespostaRepository from '../repositories/padraoRespostaRepository';
import { AlternativaResponseDTO } from '../dtos/PadraoRespostaDTO';
import { AppError } from '../middleware/errorMiddleware';
import { AVALIACAO_STATUS } from '../utils/avaliacaoStatus';

class AlternativasService {
    async getAll(): Promise<AlternativaResponseDTO[]> {
        return await alternativasRepository.findAll() as AlternativaResponseDTO[];
    }

    async getById(id: number): Promise<AlternativaResponseDTO> {
        const alternativa = await alternativasRepository.findById(id);
        if (!alternativa) throw new AppError('Alternativa não encontrada.', 404);
        return alternativa as AlternativaResponseDTO;
    }

    async getByPadrao(idPadrao: number): Promise<AlternativaResponseDTO[]> {
        return await alternativasRepository.findByPadraoResposta(idPadrao) as AlternativaResponseDTO[];
    }

    async create(data: { descricao: string; id_padrao_resp: number }): Promise<AlternativaResponseDTO> {
        const padrao = await padraoRespostaRepository.findById(data.id_padrao_resp);
        if (!padrao) throw new AppError('Padrão de resposta não encontrado.', 400);

        return await alternativasRepository.create({
            descricao: data.descricao,
            padrao_resp: { connect: { id: data.id_padrao_resp } }
        }) as AlternativaResponseDTO;
    }

    async update(id: number, data: { descricao: string; id_padrao_resp: number }): Promise<AlternativaResponseDTO> {
        const existing = await alternativasRepository.findById(id);
        if (!existing) throw new AppError('Alternativa não encontrada.', 404);

        const padrao = await padraoRespostaRepository.findById(data.id_padrao_resp);
        if (!padrao) throw new AppError('Padrão de resposta não encontrado.', 400);

        const usage = await alternativasRepository.getUsage(id);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === AVALIACAO_STATUS.RASCUNHO || s === AVALIACAO_STATUS.ATIVA);

            if (hasActiveOrDraft) {
                throw new AppError('Não é possível editar esta alternativa pois ela possui respostas em uma avaliação ativa ou rascunho.', 400);
            }

            // Se está em uso apenas em avaliações não ativas, cria uma nova alternativa e desativa a antiga
            const newAlt = await alternativasRepository.create({
                descricao: data.descricao,
                padrao_resp: { connect: { id: data.id_padrao_resp } }
            });

            await alternativasRepository.update(id, { ativo: false });
            return newAlt as AlternativaResponseDTO;
        }

        return await alternativasRepository.update(id, {
            descricao: data.descricao,
            padrao_resp: { connect: { id: data.id_padrao_resp } }
        }) as AlternativaResponseDTO;
    }

    async delete(id: number): Promise<void> {
        const existing = await alternativasRepository.findById(id);
        if (!existing) throw new AppError('Alternativa não encontrada.', 404);

        const usage = await alternativasRepository.getUsage(id);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === AVALIACAO_STATUS.RASCUNHO || s === AVALIACAO_STATUS.ATIVA);
            if (hasActiveOrDraft) {
                throw new AppError('Não é possível excluir esta alternativa pois ela possui respostas em uma avaliação ativa ou rascunho.', 400);
            } else {
                await alternativasRepository.update(id, { ativo: false });
            }
        } else {
            await alternativasRepository.remove(id);
        }
    }
}

export default new AlternativasService();
