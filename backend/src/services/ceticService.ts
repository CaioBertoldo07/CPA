import prisma from '../repositories/prismaClient';
import { env } from '../config/env';
import { buildEnvioAvaliacaoEmailTemplate } from '../utils/emailTemplateBuilder';
import { EmailProvider } from './email/emailProvider';
import { smtpEmailProvider } from './email/smtpEmailProvider';

export type CeticStatus = 'SENT' | 'FAILED' | 'ALREADY_REQUESTED';

export interface CeticResult {
    status: CeticStatus;
    message: string;
    avaliacaoId: number;
    sentTo?: string;
    cc?: string[];
    attemptId?: number;
    lastAttemptAt?: Date;
}

const SMTP_TIMEOUT_MS = 10000;

function validateConfig(): string | null {
    if (!env.CETIC_EMAIL_TO) return 'CETIC_EMAIL_TO não configurado';
    if (!env.MAIL_FROM) return 'MAIL_FROM não configurado';
    if (!env.SMTP_HOST || !env.SMTP_PORT) return 'SMTP_HOST/SMTP_PORT não configurados';
    return null;
}

async function findRecentAttempt(avaliacaoId: number, windowMinutes: number) {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    return prisma.solicitacaoCeticLog.findFirst({
        where: {
            avaliacao_id: avaliacaoId,
            status: { in: ['PENDING', 'SENT'] },
            created_at: { gte: cutoff },
        },
        orderBy: { created_at: 'desc' },
    });
}

export async function solicitarCetic(
    avaliacaoId: number,
    adminEmail: string,
    provider: EmailProvider = smtpEmailProvider,
): Promise<CeticResult> {
    const configError = validateConfig();
    if (configError) {
        console.error(`[ceticService] Config inválida: ${configError}`);
        const log = await prisma.solicitacaoCeticLog.create({
            data: {
                avaliacao_id: avaliacaoId,
                admin_email: adminEmail,
                destinatario: env.CETIC_EMAIL_TO ?? '',
                cc: env.CETIC_EMAIL_CC ?? null,
                assunto: '',
                status: 'FAILED',
                erro_resumido: configError,
            },
        });
        return {
            status: 'FAILED',
            message: 'Não foi possível enviar a solicitação ao CETIC. Use o fallback manual para copiar o conteúdo.',
            avaliacaoId,
            attemptId: log.id,
        };
    }

    const windowMinutes = env.CETIC_REQUEST_IDEMPOTENCY_WINDOW_MINUTES;
    const recent = await findRecentAttempt(avaliacaoId, windowMinutes);
    if (recent) {
        return {
            status: 'ALREADY_REQUESTED',
            message: 'Já existe uma solicitação recente para esta avaliação.',
            avaliacaoId,
            lastAttemptAt: recent.created_at,
        };
    }

    const avaliacao = await prisma.avaliacao.findUnique({ where: { id: avaliacaoId } });

    let subject: string;
    let body: string;
    try {
        const template = buildEnvioAvaliacaoEmailTemplate(avaliacao ?? {});
        subject = `[CPA] Solicitação de envio — ${template.subject}`;
        body = `Prezado CETIC,\n\nSolicitamos o envio do seguinte e-mail institucional aos avaliadores:\n\n---\nAssunto: ${template.subject}\n\n${template.body}\n---\n\nAtenciosamente,\nComissão Própria de Avaliação - CPA`;
    } catch (templateErr) {
        console.error('[ceticService] Falha ao gerar template:', templateErr);
        const log = await prisma.solicitacaoCeticLog.create({
            data: {
                avaliacao_id: avaliacaoId,
                admin_email: adminEmail,
                destinatario: env.CETIC_EMAIL_TO!,
                cc: env.CETIC_EMAIL_CC ?? null,
                assunto: '',
                status: 'FAILED',
                erro_resumido: 'Falha ao gerar template de e-mail',
            },
        });
        return {
            status: 'FAILED',
            message: 'Não foi possível enviar a solicitação ao CETIC. Use o fallback manual para copiar o conteúdo.',
            avaliacaoId,
            attemptId: log.id,
        };
    }

    const log = await prisma.solicitacaoCeticLog.create({
        data: {
            avaliacao_id: avaliacaoId,
            admin_email: adminEmail,
            destinatario: env.CETIC_EMAIL_TO!,
            cc: env.CETIC_EMAIL_CC ?? null,
            assunto: subject,
            status: 'PENDING',
        },
    });

    try {
        await provider.sendMail({
            from: env.MAIL_FROM!,
            to: env.CETIC_EMAIL_TO!,
            cc: env.CETIC_EMAIL_CC || undefined,
            subject,
            text: body,
            timeoutMs: SMTP_TIMEOUT_MS,
        });

        await prisma.solicitacaoCeticLog.update({
            where: { id: log.id },
            data: { status: 'SENT', sent_at: new Date() },
        });

        const ccList = env.CETIC_EMAIL_CC
            ? env.CETIC_EMAIL_CC.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        return {
            status: 'SENT',
            message: 'Solicitação enviada ao CETIC com sucesso.',
            avaliacaoId,
            sentTo: env.CETIC_EMAIL_TO!,
            cc: ccList,
            attemptId: log.id,
        };
    } catch (sendErr: any) {
        const errMsg = sendErr?.message?.substring(0, 490) ?? 'Erro desconhecido';
        console.error('[ceticService] Falha ao enviar e-mail:', sendErr);

        await prisma.solicitacaoCeticLog.update({
            where: { id: log.id },
            data: { status: 'FAILED', erro_resumido: errMsg },
        });

        return {
            status: 'FAILED',
            message: 'Não foi possível enviar a solicitação ao CETIC. Use o fallback manual para copiar o conteúdo.',
            avaliacaoId,
            attemptId: log.id,
        };
    }
}
