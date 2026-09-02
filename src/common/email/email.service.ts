import { Resend } from 'resend';
import { env } from "../../config/env.js";
import type { EmailOptions } from "./email.types.js";

export class EmailService {
    private static resend = new Resend(env.resend.apiKey);

    static async sendEmail(
        options: EmailOptions
    ): Promise<void> {
        const headers: Record<string, string> = {};
        
        if (options.unsubscribeLink) {
            headers["List-Unsubscribe"] = `<${options.unsubscribeLink}>`;
            headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        }

        await this.resend.emails.send({
            from: options.from || 'TalentForge <onboarding@resend.dev>',
            replyTo: options.replyTo || 'TalentForge Support <onboarding@resend.dev>',
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            html: options.html || '',
            ...(options.text && { text: options.text }),
            headers: headers
        });
    }
}