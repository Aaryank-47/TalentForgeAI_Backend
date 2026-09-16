import type { EmailOptions } from "./email.types.js";
export declare class EmailService {
    private static resend;
    private static agentMailClient;
    private static agentMailInboxId;
    static sendEmail(options: EmailOptions): Promise<void>;
}
//# sourceMappingURL=email.service.d.ts.map