import request from 'supertest';
import { setupTestApp, createAdminToken, clearDatabase } from '../helpers';
import { prismaMock } from '../setup';

describe('Integracao - Relatorios', () => {
    const app = setupTestApp();

    beforeEach(() => {
        clearDatabase();
    });

    it('GET /api/avaliacoes/:idAvaliacao/respostas retorna estrutura hierarquica', async () => {
        const token = createAdminToken();

        prismaMock.avaliacao_questoes.findMany.mockResolvedValue([
            {
                id: 101,
                questoes: {
                    id: 1,
                    descricao: 'Pergunta 1',
                    id_questoes_tipo: 1,
                    repetir_todas_disciplinas: false,
                    questoes_adicionais: [],
                    dimensoes: { numero: 1, nome: 'Dimensao 1', eixos: { numero: 1, nome: 'Eixo 1' } },
                    padrao_resposta: { alternativas: [{ descricao: 'Satisfatorio' }, { descricao: 'Insatisfatorio' }] },
                },
            },
        ]);
        prismaMock.respostas.findMany.mockResolvedValue([
            { id_avaliacao_questoes: 101, resposta: 'Satisfatorio', avaliador_matricula: 'hashA' },
        ]);
        prismaMock.respostasGrade.findMany.mockResolvedValue([]);

        const response = await request(app)
            .get('/api/avaliacoes/1/respostas')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalAvaliadores', 1);
        expect(response.body).toHaveProperty('relatorio');
    });

    it('GET /api/avaliacoes/:idAvaliacao/respostas sem questoes retorna relatorio vazio', async () => {
        const token = createAdminToken();

        prismaMock.avaliacao_questoes.findMany.mockResolvedValue([]);
        prismaMock.respostas.findMany.mockResolvedValue([]);
        prismaMock.respostasGrade.findMany.mockResolvedValue([]);

        const response = await request(app)
            .get('/api/avaliacoes/1/respostas')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body.totalAvaliadores).toBe(0);
        expect(response.body.relatorio).toEqual({});
    });

    it('GET /api/avaliacoes/:id/relatorio/disciplinas evita divisao por zero', async () => {
        const token = createAdminToken();

        prismaMock.avaliacao_questoes.findMany.mockResolvedValue([
            {
                id: 101,
                questoes: {
                    descricao: 'Pergunta sem resposta',
                    padrao_resposta: { alternativas: [{ descricao: 'A' }, { descricao: 'B' }] },
                },
            },
        ]);
        prismaMock.respostas.findMany.mockResolvedValue([]);
        prismaMock.respostasGrade.findMany.mockResolvedValue([]);

        const response = await request(app)
            .get('/api/avaliacoes/1/relatorio/disciplinas')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
});
