import * as questoesRepository from '../repositories/questoesRepository';
import * as categoriasRepository from '../repositories/categoriasRepository';
import * as modalidadesRepository from '../repositories/modalidadesRepository';
import { QuestaoResponseDTO, CreateQuestaoDTO, UpdateQuestaoDTO } from '../dtos/QuestaoDTO';
import { AppError } from '../middleware/errorMiddleware';

class QuestoesService {
    async getAll(): Promise<QuestaoResponseDTO[]> {
        const questoes = await questoesRepository.findMany();
        return questoes.map(this.mapToDTO);
    }

    async getById(id: number): Promise<QuestaoResponseDTO> {
        const questao = await questoesRepository.findById(id);
        if (!questao) {
            throw new AppError('Questão não encontrada.', 404);
        }
        const usage = await questoesRepository.getQuestionUsage(id);
        return {
            ...this.mapToDTO(questao),
            isUsed: usage.length > 0
        };
    }

    async create(data: CreateQuestaoDTO): Promise<QuestaoResponseDTO> {
        const {
            questao,
            dimensaoNumero,
            categorias,
            modalidades,
            padraoRespostaId,
            basica,
            tipo_questao,
            questoesAdicionais
        } = data;

        const categoriaIds = await Promise.all(
            categorias.map(async (catInput) => {
                if (typeof catInput === 'number' || (typeof catInput === 'string' && /^\d+$/.test(catInput))) {
                    return parseInt(catInput.toString(), 10);
                } else {
                    const categoria = await categoriasRepository.findByNome(catInput.toString());
                    if (!categoria) throw new AppError(`Categoria não encontrada: ${catInput}`, 404);
                    return categoria.id;
                }
            })
        );

        const modalidadeIds = await Promise.all(
            modalidades.map(async (mId) => {
                const idInt = parseInt(mId.toString(), 10);
                const modalidade = await modalidadesRepository.findById(idInt);
                if (!modalidade) throw new AppError(`Modalidade não encontrada: ${mId}`, 404);
                return modalidade.id;
            })
        );

        const newQuestao = await questoesRepository.create({
            descricao: questao,
            tipo_questao: { connect: { id: parseInt(tipo_questao.toString(), 10) } },
            basica,
            padrao_resposta: { connect: { id: parseInt(padraoRespostaId.toString(), 10) } },
            questoes_adicionais: { create: Array.isArray(questoesAdicionais) ? questoesAdicionais : [] },
            dimensoes: { connect: { numero: parseInt(dimensaoNumero.toString(), 10) } },
            Questoes_categorias: {
                create: categoriaIds.map(cId => ({ id_categorias: cId })),
            },
            questoes_modalidades: {
                create: modalidadeIds.map(mId => ({ id_modalidades: mId })),
            },
        });

        // Re-fecth to get all relations for the DTO
        return this.getById(newQuestao.id);
    }

    async update(id: number, data: UpdateQuestaoDTO): Promise<QuestaoResponseDTO> {
        const existingQuestao = await questoesRepository.findById(id);
        if (!existingQuestao) {
            throw new AppError('Questão não encontrada para atualizar.', 404);
        }

        const usage = await questoesRepository.getQuestionUsage(id);
        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === 1 || s === 2);

            // Clonagem (Versionamento)
            const mergedData: CreateQuestaoDTO = {
                questao: data.questao ?? existingQuestao.descricao,
                dimensaoNumero: data.dimensaoNumero ?? existingQuestao.numero_dimensoes,
                categorias: data.categorias ?? (existingQuestao.Questoes_categorias?.map((qc: any) => qc.id_categorias) || []),
                modalidades: data.modalidades ?? (existingQuestao.questoes_modalidades?.map((qm: any) => qm.id_modalidades) || []),
                padraoRespostaId: data.padraoRespostaId ?? existingQuestao.id_padrao_resposta,
                basica: data.basica ?? existingQuestao.basica,
                tipo_questao: data.tipo_questao ?? (existingQuestao.id_questoes_tipo || 1),
                questoesAdicionais: data.questoesAdicionais ?? (existingQuestao.questoes_adicionais?.map((qa: any) => ({ descricao: qa.descricao })) || [])
            };

            const newQuestao = await this.create(mergedData);

            // Somente desativa a original se não houver nenhuma avaliação Rascunho ou Ativa usando ela
            if (!hasActiveOrDraft) {
                await questoesRepository.update(id, { ativo: false });
            }

            return newQuestao;
        }

        const updateData: any = {};

        if (data.questao) updateData.descricao = data.questao;
        if (data.basica !== undefined) updateData.basica = data.basica;
        if (data.tipo_questao) updateData.tipo_questao = { connect: { id: Number(data.tipo_questao) } };
        if (data.padraoRespostaId) updateData.padrao_resposta = { connect: { id: Number(data.padraoRespostaId) } };
        if (data.dimensaoNumero) updateData.dimensoes = { connect: { numero: Number(data.dimensaoNumero) } };

        if (data.categorias) {
            const categoriaIds = await Promise.all(
                data.categorias.map(async (catInput) => {
                    if (typeof catInput === 'number' || (typeof catInput === 'string' && /^\d+$/.test(catInput))) {
                        return parseInt(catInput.toString(), 10);
                    } else {
                        const categoria = await categoriasRepository.findByNome(catInput.toString());
                        if (!categoria) throw new AppError(`Categoria não encontrada: ${catInput}`, 404);
                        return categoria.id;
                    }
                })
            );
            updateData.Questoes_categorias = {
                deleteMany: { id_questoes: id },
                create: categoriaIds.map(cId => ({ id_categorias: cId })),
            };
        }

        if (data.modalidades) {
            updateData.questoes_modalidades = {
                deleteMany: { id_questoes: id },
                create: data.modalidades.map((mId: any) => ({ id_modalidades: Number(mId) })),
            };
        }

        if (data.questoesAdicionais) {
            updateData.questoes_adicionais = {
                deleteMany: {},
                create: data.questoesAdicionais.map((q: any) => ({
                    descricao: q.descricao
                }))
            };
        }

        await questoesRepository.update(id, updateData);
        return this.getById(id);
    }

    async delete(id: number): Promise<void> {
        const questao = await questoesRepository.findById(id);
        if (!questao) {
            throw new AppError('Questão não encontrada.', 404);
        }

        const usage = await questoesRepository.getQuestionUsage(id);

        if (usage.length > 0) {
            const hasActiveOrDraft = usage.some(s => s === 1 || s === 2);

            if (hasActiveOrDraft) {
                // Bloqueia a exclusão pois afetaria uma avaliação em rascunho ou ativa
                throw new AppError('Não é possível excluir esta questão pois ela está sendo utilizada em uma avaliação ativa ou rascunho.', 400);
            } else {
                // Apenas desativa (soft delete) pois só existe em avaliações encerradas
                await questoesRepository.update(id, { ativo: false });
            }
        } else {
            // Não está em nenhuma avaliação, pode deletar de verdade
            await questoesRepository.remove(id);
        }
    }

    private mapToDTO(questao: any): QuestaoResponseDTO {
        return {
            id: questao?.id,
            descricao: questao?.descricao,
            basica: questao?.basica,
            tipo: questao?.tipo_questao?.descricao || 'Não informado',
            tipoId: questao?.tipo_questao?.id || questao?.id_questoes_tipo,
            idPadraoResposta: questao?.id_padrao_resposta,
            dimensao: {
                nome: questao?.dimensoes?.nome || 'Não informado',
                numero: questao?.dimensoes?.numero || 'Não informado',
                eixo: {
                    nome: questao?.dimensoes?.eixos?.nome || 'Não informado',
                    numero: questao?.dimensoes?.eixos?.numero || 'Não informado',
                },
            },
            categorias: questao?.Questoes_categorias.map((qc: any) => ({
                id: qc.categorias.id,
                nome: qc.categorias.nome,
            })),
            modalidades: questao?.questoes_modalidades.map((qm: any) => ({
                id: qm.modalidades.id,
                nome: qm.modalidades.mod_ensino,
            })),
            questoesAdicionais: questao?.questoes_adicionais,
        };
    }
}

export default new QuestoesService();
