import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import type { EmailOptions } from "./email.types.js";

export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: env.gmail.user,
            pass: env.gmail.pass
        }
    })

    static async sendEmail(
        options: EmailOptions
    ): Promise<void> {
        const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@talentforge.com>`;
        
        const headers: Record<string, string> = {};
        
        if (options.unsubscribeLink) {
            headers["List-Unsubscribe"] = `<${options.unsubscribeLink}>`;
            headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        }

        await this.transporter.sendMail({
            from: `"TalentForge" <${env.gmail.user}>`,
            replyTo: `"TalentForge Support" <${env.gmail.user}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            messageId: messageId,
            date: new Date(),
            headers: headers
        })
    }
}