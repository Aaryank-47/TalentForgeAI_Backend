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
        await this.transporter.sendMail({
            from: `TalentForge <${env.gmail.user}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        })
    }
}