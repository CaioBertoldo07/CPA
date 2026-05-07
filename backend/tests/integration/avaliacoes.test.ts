import request from 'supertest';
import { setupTestApp, createAdminToken, createUserToken, clearDatabase } from '../helpers';
import { createTestAvaliacao } from '../factories';
import { prismaMock } from '../setup';

describe('Integracao - Avaliacoes', () => {
    const app = setupTestApp();

    beforeEach(() => {
        clearDatabase();
    });

    it('POST /api/avaliacoes com body valido -> 201', async () => {
        const token = createAdminToken();
        const payload = createTestAvaliacao();

        prismaMock.unidades.findMany.mockResolvedValue([{ id: 1 }]);
        prismaMock.categorias.findMany.mockResolvedValue([{ id: 1, nome: 'DISCENTE' }]);
        prismaMock.questoes.findMany.mockResolvedValue([{ id: 1 }]);
        prismaMock.modalidades.findMany.mockResolvedValue([{ id: 1 }]);
        prismaMock.cursos.findMany.mockResolvedValue([{ identificador_api_lyceum: 'CURSO_TESTE' }]);
        prismaMock.avaliacao.create.mockResolvedValue({
            id: 10,
            ...payload,
            data_inicio: new Date(payload.data_inicio),
            data_fim: new Date(payload.data_fim),
            avaliacao_questoes: [{ id: 100, questoes: { id: 1 } }],
        });

        const response = await request(app)
            .post('/api/avaliacoes')
            .set('Cookie', `cpa_auth=${token}`)
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('avaliacao');
    });

    it('POST /api/avaliacoes sem token -> 401', async () => {
        const response = await request(app)
            .post('/api/avaliacoes')
            .send(createTestAvaliacao());

        expect(response.status).toBe(401);
    });

    it('POST /api/avaliacoes com role user -> 403', async () => {
        const token = createUserToken();

        const response = await request(app)
            .post('/api/avaliacoes')
            .set('Cookie', `cpa_auth=${token}`)
            .send(createTestAvaliacao());

        expect(response.status).toBe(403);
    });

    it('POST /api/avaliacoes com categoria DISCENTE sem modalidade -> 400', async () => {
        const token = createAdminToken();
        const payload = createTestAvaliacao();
        payload.modalidade = [];

        prismaMock.unidades.findMany.mockResolvedValue([{ id: 1 }]);
        prismaMock.categorias.findMany.mockResolvedValue([{ id: 1, nome: 'DISCENTE' }]);
        prismaMock.questoes.findMany.mockResolvedValue([{ id: 1 }]);

        const response = await request(app)
            .post('/api/avaliacoes')
            .set('Cookie', `cpa_auth=${token}`)
            .send(payload);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/modalidade/i);
    });

    it('GET /api/avaliacoes paginado -> 200 com { data, meta }', async () => {
        const token = createAdminToken();

        prismaMock.avaliacao.updateMany.mockResolvedValue({ count: 0 });
        prismaMock.avaliacao.findMany.mockResolvedValue([
            {
                id: 1,
                periodo_letivo: '2025.1',
                data_inicio: new Date('2025-01-10'),
                data_fim: new Date('2025-12-10'),
                status: 1,
                ano: '2025',
                avaliacao_questoes: [],
                unidade: [],
                cursos: [],
                categorias: [],
                modalidades: [],
            },
        ]);
        prismaMock.avaliacao.count.mockResolvedValue(1);

        const response = await request(app)
            .get('/api/avaliacoes?page=0&pageSize=10')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
        expect(response.body.meta).toMatchObject({ total: 1, page: 0, limit: 10 });
    });

    it('PUT /api/avaliacoes/:id/enviar -> 200 com emailTemplate', async () => {
        const token = createAdminToken();
        const dataFimFutura = new Date(Date.now() + 86400000 * 30);

        prismaMock.avaliacao.findUnique.mockResolvedValue({
            id: 1,
            status: 1,
            ano: '2025',
            periodo_letivo: '2025.1',
            data_inicio: new Date('2025-01-10'),
            data_fim: dataFimFutura,
            unidade: [{ id: 1, nome: 'EST' }],
            cursos: [],
            categorias: [{ id: 1, nome: 'TECNICO' }],
            modalidades: [],
            avaliacao_questoes: [{ id: 1 }],
        });

        prismaMock.avaliacao.update.mockResolvedValue({
            id: 1,
            status: 2,
            ano: '2025',
            periodo_letivo: '2025.1',
            data_inicio: new Date('2025-01-10'),
            data_fim: dataFimFutura,
            avaliacao_questoes: [],
            unidade: [],
            cursos: [],
            categorias: [],
            modalidades: [],
        });

        const response = await request(app)
            .put('/api/avaliacoes/1/enviar')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Avaliação enviada com sucesso.');
        expect(response.body).toHaveProperty('avaliacao');
        expect(response.body).toHaveProperty('emailTemplate');
        expect(response.body.emailTemplate).toHaveProperty('subject');
        expect(response.body.emailTemplate).toHaveProperty('body');
        expect(response.body.emailTemplate).toHaveProperty('systemUrl');
        expect(typeof response.body.emailTemplate.subject).toBe('string');
        expect(typeof response.body.emailTemplate.body).toBe('string');
        expect(typeof response.body.emailTemplate.systemUrl).toBe('string');
    });

    it('PUT /api/avaliacoes/:id/enviar sem token -> 401', async () => {
        const response = await request(app).put('/api/avaliacoes/1/enviar');
        expect(response.status).toBe(401);
    });

    it('PUT /api/avaliacoes/:id/enviar com role user -> 403', async () => {
        const token = createUserToken();
        const response = await request(app)
            .put('/api/avaliacoes/1/enviar')
            .set('Cookie', `cpa_auth=${token}`);
        expect(response.status).toBe(403);
    });

    it('PUT /api/avaliacoes/:id/enviar com status diferente de rascunho -> 400', async () => {
        const token = createAdminToken();

        prismaMock.avaliacao.findUnique.mockResolvedValue({
            id: 1,
            status: 2,
            ano: '2025',
            periodo_letivo: '2025.1',
            data_inicio: new Date('2025-01-10'),
            data_fim: new Date(Date.now() + 86400000),
            unidade: [{ id: 1 }],
            cursos: [],
            categorias: [{ id: 1, nome: 'TECNICO' }],
            modalidades: [],
            avaliacao_questoes: [{ id: 1 }],
        });

        const response = await request(app)
            .put('/api/avaliacoes/2/enviar')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/rascunho/i);
    });

    it('PUT /api/avaliacoes/:id/enviar com avaliacao inexistente -> 404', async () => {
        const token = createAdminToken();

        prismaMock.avaliacao.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .put('/api/avaliacoes/999/enviar')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(404);
    });

    it('DELETE /api/avaliacoes/:id -> 200', async () => {
        const token = createAdminToken();

        prismaMock.avaliacao.findUnique.mockResolvedValue({
            id: 1,
            status: 1,
            data_fim: new Date('2025-12-10'),
            unidade: [],
            cursos: [],
            categorias: [],
            modalidades: [],
            avaliacao_questoes: [],
        });
        prismaMock.avaliacao_questoes.findMany.mockResolvedValue([{ id: 101 }]);
        prismaMock.respostas.findFirst.mockResolvedValue(null);
        prismaMock.respostasGrade.findFirst.mockResolvedValue(null);
        prismaMock.avaliacao.delete.mockResolvedValue({ id: 1 });

        const response = await request(app)
            .delete('/api/avaliacoes/1')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toMatch(/exclu[ií]da com sucesso/i);
    });
});
