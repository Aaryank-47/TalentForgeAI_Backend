import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
export class EmailService {
    static transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: env.gmail.user,
            pass: env.gmail.pass
        }
    });
    static async sendEmail(options) {
        await this.transporter.sendMail({
            from: `TalentForge <${env.gmail.user}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        });
    }
}
//# sourceMappingURL=email.service.js.map