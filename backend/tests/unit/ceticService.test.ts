const mockEnv = {
    CETIC_EMAIL_TO: 'cetic@uea.edu.br' as string | undefined,
    MAIL_FROM: 'cpa@uea.edu.br' as string | undefined,
    SMTP_HOST: 'smtp.uea.edu.br' as string | undefined,
    SMTP_PORT: 587 as number | undefined,
    SMTP_SECURE: false,
    CETIC_EMAIL_CC: undefined as string | undefined,
    CETIC_REQUEST_IDEMPOTENCY_WINDOW_MINUTES: 10,
    APP_PUBLIC_URL: 'http://localhost:5173' as string | undefined,
};

jest.mock('../../src/config/env', () => ({ env: mockEnv }));
jest.mock('../../src/utils/emailTemplateBuilder', () => ({
    buildEnvioAvaliacaoEmailTemplate: jest.fn().mockReturnValue({
        subject: 'Nova avaliação CPA disponível',
        body: 'Corpo do e-mail de teste',
        systemUrl: 'http://localhost:5173',
    }),
}));

import { solicitarCetic } from '../../src/services/ceticService';
import { prismaMock } from '../setup';
import { clearDatabase } from '../helpers';
import { EmailProvider } from '../../src/services/email/emailProvider';

const makeProvider = (impl?: Partial<EmailProvider>): EmailProvider => ({
    sendMail: jest.fn().mockResolvedValue(undefined),
    ...impl,
});

const baseLog = {
    id: 1,
    avaliacao_id: 1,
    admin_email: 'admin@uea.edu.br',
    destinatario: 'cetic@uea.edu.br',
    cc: null,
    assunto: 'assunto',
    payload_hash: null,
    status: 'PENDING',
    erro_resumido: null,
    created_at: new Date(),
    sent_at: null,
};

const baseAvaliacao = {
    id: 1,
    status: 2,
    ano: '2025',
    periodo_letivo: '2025.1',
    data_inicio: new Date('2025-01-10'),
    data_fim: new Date('2025-12-10'),
};

describe('Unit - ceticService', () => {
    beforeEach(() => {
        clearDatabase();
        mockEnv.CETIC_EMAIL_TO = 'cetic@uea.edu.br';
        mockEnv.MAIL_FROM = 'cpa@uea.edu.br';
        mockEnv.SMTP_HOST = 'smtp.uea.edu.br';
        mockEnv.SMTP_PORT = 587;
        mockEnv.CETIC_EMAIL_CC = undefined;
    });

    it('retorna SENT quando o envio é bem-sucedido', async () => {
        prismaMock.solicitacaoCeticLog.findFirst.mockResolvedValue(null);
        prismaMock.avaliacao.findUnique.mockResolvedValue(baseAvaliacao as any);
        prismaMock.solicitacaoCeticLog.create.mockResolvedValue({ ...baseLog, id: 5 });
        prismaMock.solicitacaoCeticLog.update.mockResolvedValue({ ...baseLog, id: 5, status: 'SENT' });

        const provider = makeProvider();
        const result = await solicitarCetic(1, 'admin@uea.edu.br', provider);

        expect(result.status).toBe('SENT');
        expect(result.sentTo).toBe('cetic@uea.edu.br');
        expect(result.attemptId).toBe(5);
        expect(provider.sendMail).toHaveBeenCalledTimes(1);
        expect(prismaMock.solicitacaoCeticLog.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ status: 'SENT' }) })
        );
    });

    it('retorna FAILED e registra log quando o envio SMTP falha', async () => {
        prismaMock.solicitacaoCeticLog.findFirst.mockResolvedValue(null);
        prismaMock.avaliacao.findUnique.mockResolvedValue(baseAvaliacao as any);
        prismaMock.solicitacaoCeticLog.create.mockResolvedValue({ ...baseLog, id: 7 });
        prismaMock.solicitacaoCeticLog.update.mockResolvedValue({ ...baseLog, id: 7, status: 'FAILED' });

        const provider = makeProvider({
            sendMail: jest.fn().mockRejectedValue(new Error('Connection refused')),
        });
        const result = await solicitarCetic(1, 'admin@uea.edu.br', provider);

        expect(result.status).toBe('FAILED');
        expect(result.attemptId).toBe(7);
        expect(prismaMock.solicitacaoCeticLog.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) })
        );
    });

    it('retorna ALREADY_REQUESTED sem criar novo log quando há tentativa recente', async () => {
        prismaMock.solicitacaoCeticLog.findFirst.mockResolvedValue({
            ...baseLog,
            status: 'SENT',
            created_at: new Date(),
        });

        const provider = makeProvider();
        const result = await solicitarCetic(1, 'admin@uea.edu.br', provider);

        expect(result.status).toBe('ALREADY_REQUESTED');
        expect(result.lastAttemptAt).toBeDefined();
        expect(provider.sendMail).not.toHaveBeenCalled();
        expect(prismaMock.solicitacaoCeticLog.create).not.toHaveBeenCalled();
    });

    it('retorna FAILED imediatamente quando config está incompleta', async () => {
        mockEnv.CETIC_EMAIL_TO = undefined;
        prismaMock.solicitacaoCeticLog.create.mockResolvedValue({ ...baseLog, id: 9, status: 'FAILED' });

        const provider = makeProvider();
        const result = await solicitarCetic(1, 'admin@uea.edu.br', provider);

        expect(result.status).toBe('FAILED');
        expect(provider.sendMail).not.toHaveBeenCalled();
    });

    it('retorna FAILED sem alterar status da avaliacao quando SMTP faz timeout', async () => {
        prismaMock.solicitacaoCeticLog.findFirst.mockResolvedValue(null);
        prismaMock.avaliacao.findUnique.mockResolvedValue(baseAvaliacao as any);
        prismaMock.solicitacaoCeticLog.create.mockResolvedValue({ ...baseLog, id: 11 });
        prismaMock.solicitacaoCeticLog.update.mockResolvedValue({ ...baseLog, id: 11, status: 'FAILED' });
        prismaMock.avaliacao.update.mockClear();

        const provider = makeProvider({
            sendMail: jest.fn().mockRejectedValue(new Error('Timeout SMTP após 10000ms')),
        });
        const result = await solicitarCetic(1, 'admin@uea.edu.br', provider);

        expect(result.status).toBe('FAILED');
        expect(prismaMock.avaliacao.update).not.toHaveBeenCalled();
    });
});
