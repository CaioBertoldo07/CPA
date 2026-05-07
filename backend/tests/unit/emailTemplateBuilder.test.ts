import { buildEnvioAvaliacaoEmailTemplate } from '../../src/utils/emailTemplateBuilder';

describe('Unit - buildEnvioAvaliacaoEmailTemplate', () => {
    it('retorna os três campos com dados completos', () => {
        const template = buildEnvioAvaliacaoEmailTemplate({
            titulo: 'Avaliação CPA - 2025.1',
            periodo_letivo: '2025.1',
            data_inicio: new Date('2025-01-10'),
            data_fim: new Date('2025-12-10'),
        });

        expect(template).toHaveProperty('subject', 'Nova avaliação CPA disponível');
        expect(template).toHaveProperty('systemUrl', 'http://localhost:5173');
        expect(template.body).toContain('Período letivo: 2025.1');
        expect(template.body).toContain('Vigência:');
        expect(template.body).toContain('http://localhost:5173');
    });

    it('não lança exceção com dados mínimos (sem data_inicio e data_fim)', () => {
        let template: ReturnType<typeof buildEnvioAvaliacaoEmailTemplate> | undefined;

        expect(() => {
            template = buildEnvioAvaliacaoEmailTemplate({ periodo_letivo: '2025.1' });
        }).not.toThrow();

        expect(template!.body).toContain('Período letivo: 2025.1');
        expect(template!.body).not.toContain('Vigência:');
        expect(template!).toHaveProperty('subject');
        expect(template!).toHaveProperty('systemUrl');
    });

    it('não lança exceção com periodo_letivo undefined', () => {
        let template: ReturnType<typeof buildEnvioAvaliacaoEmailTemplate> | undefined;

        expect(() => {
            template = buildEnvioAvaliacaoEmailTemplate({});
        }).not.toThrow();

        expect(template!.body).not.toContain('Período letivo:');
        expect(template!.body).not.toContain('Vigência:');
        expect(template!).toHaveProperty('subject');
        expect(template!).toHaveProperty('systemUrl');
    });

    it('lança erro quando APP_PUBLIC_URL não está configurada', () => {
        let fn: typeof buildEnvioAvaliacaoEmailTemplate | undefined;

        jest.isolateModules(() => {
            jest.mock('../../src/config/env', () => ({
                env: { APP_PUBLIC_URL: undefined },
            }));
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            fn = require('../../src/utils/emailTemplateBuilder').buildEnvioAvaliacaoEmailTemplate;
        });

        expect(() => fn!({ periodo_letivo: '2025.1' })).toThrow('APP_PUBLIC_URL');
    });
});
