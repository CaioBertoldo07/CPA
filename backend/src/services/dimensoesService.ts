import * as dimensoesRepository from '../repositories/dimensoesRepository';
import * as eixosRepository from '../repositories/eixosRepository';
import { DimensoesResponseDTO } from '../dtos/EixoDTO';
import { AppError } from '../middleware/errorMiddleware';
import { AVALIACAO_STATUS } from '../utils/avaliacaoStatus';

class DimensoesService {
    async getAll(): Promise<DimensoesResponseDTO[]> {
        const dimensoes = await dimensoesRepository.findAll();
        return dimensoes as DimensoesResponseDTO[];
    }

    async getByNumero(numero: number): Promise<DimensoesResponseDTO> {
        const dimensao = await dimensoesRepository.findByNumero(numero);
        if (!dimensao) throw new AppError('Dimensão não encontrada.', 404);
        
        const usage = await dimensoesRepository.getUsage(numero);
        return {
            ...dimensao,
            isUsed: usage.length > 0
        } as DimensoesResponseDTO;
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

    async update(numero: number, data: { numero?: number; nome?: string; numero_eixos?: number }): Promise<DimensoesResponseDTO> {
        const { numero: novoNumero, nome, numero_eixos } = data;

        const dimensaoExists = await dimensoesRepository.findByNumero(numero);
        if (!dimensaoExists) throw new AppError('Dimensão não encontrada para atualizar.', 404);

        if (novoNumero !== undefined && novoNumero !== numero) {
            const dimensaoComNovoNumero = await dimensoesRepository.findByNumero(novoNumero);
            if (dimensaoComNovoNumero) throw new AppError('Já existe uma dimensão com o número informado.', 400);
        }

        if (numero_eixos !== undefined) {
            const eixoExists = await eixosRepository.findByNumero(numero_eixos);
            if (!eixoExists) throw new AppError('Número de eixo fornecido não existe.', 400);
        }

        const usage = await dimensoesRepository.getUsage(numero);
        if (usage.length > 0) {
            // Se já foi usada, não permitimos mudar o número pois quebraria o histórico.
            // Para mudar o nome, poderíamos clonar se o ID fosse serial, mas como é 'numero',
            // apenas permitimos a edição se for apenas o nome e o usuário estiver ciente,
            // ou bloqueamos se for ativo/rascunho.
            const hasActiveOrDraft = usage.some(s => s === AVALIACAO_STATUS.RASCUNHO || s === AVALIACAO_STATUS.ATIVA);
            if (hasActiveOrDraft) {
                throw new AppError('Não é possível editar esta dimensão pois ela está sendo utilizada em uma avaliação ativa ou rascunho.', 400);
            }
            // Se for apenas encerrada, permitimos editar o nome mas protegemos o número
            if (novoNumero !== undefined && novoNumero !== numero) {
                throw new AppError('Não é possível alterar o número de uma dimensão que já possui histórico de avaliações.', 400);
            }
        }

        const updateData: any = {};
        if (novoNumero !== undefined) updateData.numero = novoNumero;
        if (nome !== undefined) updateData.nome = nome;
        if (numero_eixos !== undefined) updateData.eixos = { connect: { numero: numero_eixos } };

        if (Object.keys(updateData).length === 0) {
            throw new AppError('Nenhum campo válido foi informado para atualização.', 400);
        }

        return await dimensoesRepository.update(numero, updateData) as DimensoesResponseDTO;
    }

    async delete(numero: number): Promise<void> {
        const dimensaoExists = await dimensoesRepository.findByNumero(numero);
        if (!dimensaoExists) throw new AppError('Dimensão não encontrada.', 404);

        const usage = await dimensoesRepository.getUsage(numero);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === AVALIACAO_STATUS.RASCUNHO || s === AVALIACAO_STATUS.ATIVA);
            if (hasActiveOrDraft) {
                throw new AppError('Não é possível excluir esta dimensão pois ela está sendo utilizada em uma avaliação ativa ou rascunho.', 400);
            } else {
                // Soft delete
                await dimensoesRepository.update(numero, { ativo: false });
            }
        } else {
            // Hard delete
            await dimensoesRepository.remove(numero);
        }
    }
}

export default new DimensoesService();
