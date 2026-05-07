import avaliacoesService from '../../src/services/avaliacoesService';
import * as avaliacaoRepository from '../../src/repositories/avaliacaoRepository';
import * as universityTokenStore from '../../src/services/universityTokenStore';
import { AppError } from '../../src/middleware/errorMiddleware';
import { clearDatabase } from '../helpers';
import { createTestAvaliacao } from '../factories';

describe('Unit - AvaliacoesService', () => {
    beforeEach(() => {
        clearDatabase();
    });

    it('create() com categoria DISCENTE sem modalidade -> AppError 400', async () => {
        const payload = createTestAvaliacao();
        payload.modalidade = [];

        jest.spyOn(avaliacaoRepository, 'validateUnidades').mockResolvedValue([{ id: 1 } as any]);
        jest.spyOn(avaliacaoRepository, 'validateCategorias').mockResolvedValue([{ id: 1, nome: 'DISCENTE' } as any]);
        jest.spyOn(avaliacaoRepository, 'validateQuestoes').mockResolvedValue([{ id: 1 } as any]);

        await expect(avaliacoesService.create(payload)).rejects.toEqual(
            expect.objectContaining({ statusCode: 400 }),
        );
    });

    it('create() com unidade inexistente -> AppError 404', async () => {
        const payload = createTestAvaliacao();

        jest.spyOn(avaliacaoRepository, 'validateUnidades').mockResolvedValue([] as any);
        jest.spyOn(avaliacaoRepository, 'validateCategorias').mockResolvedValue([{ id: 1, nome: 'DISCENTE' } as any]);
        jest.spyOn(avaliacaoRepository, 'validateQuestoes').mockResolvedValue([{ id: 1 } as any]);

        await expect(avaliacoesService.create(payload)).rejects.toEqual(
            expect.objectContaining({ statusCode: 404 }),
        );
    });

    it('hasUserResponded() retorna boolean correto', async () => {
        jest.spyOn(avaliacaoRepository, 'findRespostaDoAvaliador').mockResolvedValueOnce({ id: 1 } as any);

        const responded = await avaliacoesService.hasUserResponded('20250001', 1);
        expect(responded).toBe(true);

        jest.spyOn(avaliacaoRepository, 'findRespostaDoAvaliador').mockResolvedValueOnce(null);
        const notResponded = await avaliacoesService.hasUserResponded('20250001', 1);
        expect(notResponded).toBe(false);
    });

    it('getById() com periodo_letivo invalido (sem ponto) -> AppError 400', async () => {
        jest.spyOn(avaliacaoRepository, 'findById').mockResolvedValue({
            id: 1,
            periodo_letivo: '2025',
            avaliacao_questoes: [],
        } as any);
        jest.spyOn(universityTokenStore, 'getUniversityToken').mockReturnValue('token-valido');

        await expect(
            avaliacoesService.getById(1, {
                email: 'user@uea.edu.br',
                role: 'user',
                isAdmin: false,
            } as any),
        ).rejects.toEqual(expect.objectContaining({ statusCode: 400 }));
    });
});
