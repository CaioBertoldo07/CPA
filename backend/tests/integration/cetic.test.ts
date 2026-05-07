import request from 'supertest';
import { setupTestApp, createAdminToken, createUserToken, clearDatabase } from '../helpers';

const mockSolicitarCetic = jest.fn();
jest.mock('../../src/services/ceticService', () => ({
    solicitarCetic: (...args: any[]) => mockSolicitarCetic(...args),
}));

describe('Integracao - CETIC solicitar-cetic', () => {
    const app = setupTestApp();

    beforeEach(() => {
        clearDatabase();
        mockSolicitarCetic.mockReset();
    });

    it('POST /api/avaliacoes/:id/solicitar-cetic sem token -> 401', async () => {
        const response = await request(app).post('/api/avaliacoes/1/solicitar-cetic');
        expect(response.status).toBe(401);
    });

    it('POST /api/avaliacoes/:id/solicitar-cetic com role user -> 403', async () => {
        const token = createUserToken();
        const response = await request(app)
            .post('/api/avaliacoes/1/solicitar-cetic')
            .set('Cookie', `cpa_auth=${token}`);
        expect(response.status).toBe(403);
    });

    it('POST /api/avaliacoes/:id/solicitar-cetic com sucesso -> 200 SENT', async () => {
        const token = createAdminToken();
        mockSolicitarCetic.mockResolvedValue({
            status: 'SENT',
            message: 'Solicitação enviada ao CETIC com sucesso.',
            avaliacaoId: 1,
            sentTo: 'cetic@uea.edu.br',
            cc: [],
            attemptId: 3,
        });

        const response = await request(app)
            .post('/api/avaliacoes/1/solicitar-cetic')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('SENT');
        expect(response.body).toHaveProperty('sentTo', 'cetic@uea.edu.br');
        expect(response.body).toHaveProperty('attemptId', 3);
        expect(response.body).toHaveProperty('avaliacaoId', 1);
        expect(mockSolicitarCetic).toHaveBeenCalledWith(1, 'admin@uea.edu.br');
    });

    it('POST /api/avaliacoes/:id/solicitar-cetic com tentativa recente -> 200 ALREADY_REQUESTED', async () => {
        const token = createAdminToken();
        const lastAttemptAt = new Date().toISOString();
        mockSolicitarCetic.mockResolvedValue({
            status: 'ALREADY_REQUESTED',
            message: 'Já existe uma solicitação recente para esta avaliação.',
            avaliacaoId: 1,
            lastAttemptAt,
        });

        const response = await request(app)
            .post('/api/avaliacoes/1/solicitar-cetic')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ALREADY_REQUESTED');
        expect(response.body).toHaveProperty('lastAttemptAt');
    });

    it('POST /api/avaliacoes/:id/solicitar-cetic com falha -> 200 FAILED com mensagem de fallback', async () => {
        const token = createAdminToken();
        mockSolicitarCetic.mockResolvedValue({
            status: 'FAILED',
            message: 'Não foi possível enviar a solicitação ao CETIC. Use o fallback manual para copiar o conteúdo.',
            avaliacaoId: 1,
            attemptId: 9,
        });

        const response = await request(app)
            .post('/api/avaliacoes/1/solicitar-cetic')
            .set('Cookie', `cpa_auth=${token}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('FAILED');
        expect(response.body.message).toMatch(/fallback manual/i);
        expect(response.body).toHaveProperty('attemptId', 9);
    });
});
