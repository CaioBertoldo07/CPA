import respostasService from '../../src/services/respostasService';
import * as respostasRepository from '../../src/repositories/respostasRepository';
import * as avaliacaoRepository from '../../src/repositories/avaliacaoRepository';
import { AppError } from '../../src/middleware/errorMiddleware';
import { clearDatabase } from '../helpers';
import { prismaMock } from '../setup';

describe('Unit - RespostasService', () => {
    beforeEach(() => {
        clearDatabase();
    });

    it('salvar() com avaliador que ja respondeu -> AppError 400', async () => {
        prismaMock.respostas.findFirst.mockResolvedValue({ id: 1 });

        await expect(
            respostasService.salvar(
                { idAvaliacao: 1, respostas: [{ id_avaliacao_questoes: 123, id_alternativa: 1 }] },
                '20250001',
            ),
        ).rejects.toEqual(expect.objectContaining({ statusCode: 400 }));
    });

    it('salvar() questao tipo grade -> chama createRespostaGrade e nao createResposta', async () => {
        prismaMock.respostas.findFirst.mockResolvedValue(null);

        jest.spyOn(avaliacaoRepository, 'findAvaliacaoQuestaoWithDetails').mockResolvedValue({
            id: 123,
            questoes: {
                id: 10,
                id_questoes_tipo: 2,
                id_padrao_resposta: 1,
            },
        } as any);
        jest.spyOn(respostasRepository, 'findAlternativa').mockResolvedValue({
            id: 1,
            descricao: 'Satisfatorio',
            id_padrao_resp: 1,
        } as any);

        const spyCreateGrade = jest.spyOn(respostasRepository, 'createRespostaGrade').mockResolvedValue({} as any);
        const spyCreatePadrao = jest.spyOn(respostasRepository, 'createResposta').mockResolvedValue({} as any);

        await respostasService.salvar(
            {
                idAvaliacao: 1,
                respostas: [{
                    id_avaliacao_questoes: '123___Matematica',
                    id_alternativa: 1,
                    id_questoes_adicionais: 'DISC_Matematica',
                }],
            },
            '20250001',
        );

        expect(spyCreateGrade).toHaveBeenCalledTimes(1);
        expect(spyCreatePadrao).not.toHaveBeenCalled();
    });

    it('salvar() alternativa com id_padrao_resp diferente -> AppError 400', async () => {
        prismaMock.respostas.findFirst.mockResolvedValue(null);

        jest.spyOn(avaliacaoRepository, 'findAvaliacaoQuestaoWithDetails').mockResolvedValue({
            id: 123,
            questoes: {
                id: 10,
                id_questoes_tipo: 1,
                id_padrao_resposta: 1,
            },
        } as any);
        jest.spyOn(respostasRepository, 'findAlternativa').mockResolvedValue({
            id: 1,
            descricao: 'Errada',
            id_padrao_resp: 2,
        } as any);

        await expect(
            respostasService.salvar(
                { idAvaliacao: 1, respostas: [{ id_avaliacao_questoes: 123, id_alternativa: 1 }] },
                '20250001',
            ),
        ).rejects.toEqual(expect.objectContaining({ statusCode: 400 }));
    });

    it('getRespostasRelatorio() retorna estrutura Eixo -> Dimensao -> Questao', async () => {
        prismaMock.avaliacao_questoes.findMany.mockResolvedValue([
            {
                id: 101,
                questoes: {
                    id: 1,
                    descricao: 'Pergunta 1',
                    id_questoes_tipo: 1,
                    repetir_todas_disciplinas: false,
                    questoes_adicionais: [],
                    dimensoes: {
                        numero: 1,
                        nome: 'Dimensao 1',
                        eixos: { numero: 1, nome: 'Eixo 1' },
                    },
                    padrao_resposta: {
                        alternativas: [{ descricao: 'Satisfatorio' }, { descricao: 'Insatisfatorio' }],
                    },
                },
            },
        ]);
        prismaMock.respostas.findMany.mockResolvedValue([
            { id_avaliacao_questoes: 101, resposta: 'Satisfatorio', avaliador_matricula: 'hash1' },
        ]);
        prismaMock.respostasGrade.findMany.mockResolvedValue([]);

        const result = await respostasService.getRespostasRelatorio(1);

        expect(result.totalAvaliadores).toBe(1);
        const eixo = result.relatorio['1 - Eixo 1'];
        expect(eixo).toBeDefined();
        expect(eixo.dimensoes['1 - Dimensao 1'].questoes).toHaveLength(1);
    });

    it('getRespostasRelatorio() sem respostas mantém porcentagens em 0.00', async () => {
        prismaMock.avaliacao_questoes.findMany.mockResolvedValue([
            {
                id: 101,
                questoes: {
                    id: 1,
                    descricao: 'Pergunta 1',
                    id_questoes_tipo: 1,
                    repetir_todas_disciplinas: false,
                    questoes_adicionais: [],
                    dimensoes: {
                        numero: 1,
                        nome: 'Dimensao 1',
                        eixos: { numero: 1, nome: 'Eixo 1' },
                    },
                    padrao_resposta: {
                        alternativas: [{ descricao: 'Satisfatorio' }],
                    },
                },
            },
        ]);
        prismaMock.respostas.findMany.mockResolvedValue([]);
        prismaMock.respostasGrade.findMany.mockResolvedValue([]);

        const result = await respostasService.getRespostasRelatorio(1);
        const questao = result.relatorio['1 - Eixo 1'].dimensoes['1 - Dimensao 1'].questoes[0];

        expect(questao.respostas.Satisfatorio.porcentagem).toBe('0.00');
    });
});
