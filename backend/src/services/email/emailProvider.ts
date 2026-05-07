export interface SendMailOptions {
    to: string;
    cc?: string;
    from: string;
    subject: string;
    text: string;
    timeoutMs?: number;
}

export interface EmailProvider {
    sendMail(options: SendMailOptions): Promise<void>;
}
