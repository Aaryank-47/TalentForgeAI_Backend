export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}