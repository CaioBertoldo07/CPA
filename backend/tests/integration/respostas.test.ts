import request from 'supertest';
import { setupTestApp, createUserToken, clearDatabase } from '../helpers';
import { prismaMock } from '../setup';

describe('Integracao - Respostas', () => {
    const app = setupTestApp();

    beforeEach(() => {
        clearDatabase();
    });

    it('POST /api/respostas resposta padrao valida -> 201', async () => {
        const token = createUserToken();

        prismaMock.respostas.findFirst.mockResolvedValue(null);
        prismaMock.avaliacao_questoes.findUnique.mockResolvedValue({
            id: 123,
            questoes: {
                id: 10,
                id_questoes_tipo: 1,
                id_padrao_resposta: 1,
                questoes_adicionais: [],
            },
        });
        prismaMock.alternativas.findUnique.mockResolvedValue({
            id: 1,
            descricao: 'Satisfatorio',
            id_padrao_resp: 1,
        });
        prismaMock.respostas.create.mockResolvedValue({ id: 999 });

        const response = await request(app)
            .post('/api/respostas')
            .set('Cookie', `cpa_auth=${token}`)
            .send({
                idAvaliacao: 1,
                respostas: [{ id_avaliacao_questoes: 123, id_alternativa: 1 }],
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toMatch(/salvas com sucesso/i);
    });

    it('POST /api/respostas segunda tentativa mesma avaliacao -> 400', async () => {
        const token = createUserToken();

        prismaMock.respostas.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ id: 1 });

        prismaMock.avaliacao_questoes.findUnique.mockResolvedValue({
            id: 123,
            questoes: {
                id: 10,
                id_questoes_tipo: 1,
                id_padrao_resposta: 1,
                questoes_adicionais: [],
            },
        });
        prismaMock.alternativas.findUnique.mockResolvedValue({
            id: 1,
            descricao: 'Satisfatorio',
            id_padrao_resp: 1,
        });
        prismaMock.respostas.create.mockResolvedValue({ id: 999 });

        await request(app)
            .post('/api/respostas')
            .set('Cookie', `cpa_auth=${token}`)
            .send({
                idAvaliacao: 1,
                respostas: [{ id_avaliacao_questoes: 123, id_alternativa: 1 }],
            });

        const second = await request(app)
            .post('/api/respostas')
            .set('Cookie', `cpa_auth=${token}`)
            .send({
                idAvaliacao: 1,
                respostas: [{ id_avaliacao_questoes: 123, id_alternativa: 1 }],
            });

        expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/j[aá] respondeu/i);
    });

    it('POST /api/respostas alternativa com padrao_resposta errado -> 400', async () => {
        const token = createUserToken();

        prismaMock.respostas.findFirst.mockResolvedValue(null);
        prismaMock.avaliacao_questoes.findUnique.mockResolvedValue({
            id: 123,
            questoes: {
                id: 10,
                id_questoes_tipo: 1,
                id_padrao_resposta: 1,
                questoes_adicionais: [],
            },
        });
        prismaMock.alternativas.findUnique.mockResolvedValue({
            id: 1,
            descricao: 'Errada',
            id_padrao_resp: 2,
        });

        const response = await request(app)
            .post('/api/respostas')
            .set('Cookie', `cpa_auth=${token}`)
            .send({
                idAvaliacao: 1,
                respostas: [{ id_avaliacao_questoes: 123, id_alternativa: 1 }],
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/inv[aá]lida/i);
    });

    it('POST /api/respostas id_avaliacao_questoes formato 123___Matematica -> 201 grade', async () => {
        const token = createUserToken();

        prismaMock.respostas.findFirst.mockResolvedValue(null);
        prismaMock.avaliacao_questoes.findUnique.mockResolvedValue({
            id: 123,
            questoes: {
                id: 10,
                id_questoes_tipo: 2,
                id_padrao_resposta: 1,
                questoes_adicionais: [],
            },
        });
        prismaMock.alternativas.findUnique.mockResolvedValue({
            id: 1,
            descricao: 'Satisfatorio',
            id_padrao_resp: 1,
        });
        prismaMock.respostasGrade.create.mockResolvedValue({ id: 555 });

        const response = await request(app)
            .post('/api/respostas')
            .set('Cookie', `cpa_auth=${token}`)
            .send({
                idAvaliacao: 1,
                respostas: [{
                    id_avaliacao_questoes: '123___Matematica',
                    id_alternativa: 1,
                    id_questoes_adicionais: 'DISC_Matematica',
                }],
            });

        expect(response.status).toBe(201);
        expect(prismaMock.respostasGrade.create).toHaveBeenCalledTimes(1);
    });

    it('POST /api/respostas id_avaliacao_questoes inexistente -> 404', async () => {
        const token = createUserToken();

        prismaMock.respostas.findFirst.mockResolvedValue(null);
        prismaMock.avaliacao_questoes.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/respostas')
            .set('Cookie', `cpa_auth=${token}`)
            .send({
                idAvaliacao: 1,
                respostas: [{ id_avaliacao_questoes: 999, id_alternativa: 1 }],
            });

        expect(response.status).toBe(404);
    });

    it('POST /api/respostas sem token -> 401', async () => {
        const response = await request(app)
            .post('/api/respostas')
            .send({ idAvaliacao: 1, respostas: [{ id_avaliacao_questoes: 123, id_alternativa: 1 }] });

        expect(response.status).toBe(401);
    });
});
