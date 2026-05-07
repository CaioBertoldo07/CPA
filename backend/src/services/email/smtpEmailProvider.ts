import nodemailer from 'nodemailer';
import { EmailProvider, SendMailOptions } from './emailProvider';
import { env } from '../../config/env';

export class SmtpEmailProvider implements EmailProvider {
    async sendMail(opts: SendMailOptions): Promise<void> {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = env;

        if (!SMTP_HOST || !SMTP_PORT) {
            throw new Error('SMTP_HOST e SMTP_PORT não configurados');
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_SECURE,
            auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        });

        const timeoutMs = opts.timeoutMs ?? 10000;

        const sendPromise = transporter.sendMail({
            from: opts.from,
            to: opts.to,
            cc: opts.cc,
            subject: opts.subject,
            text: opts.text,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout SMTP após ${timeoutMs}ms`)), timeoutMs)
        );

        await Promise.race([sendPromise, timeoutPromise]);
    }
}

export const smtpEmailProvider = new SmtpEmailProvider();
