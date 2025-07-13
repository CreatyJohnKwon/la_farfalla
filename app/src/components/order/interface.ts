export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface SMTPConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
}
