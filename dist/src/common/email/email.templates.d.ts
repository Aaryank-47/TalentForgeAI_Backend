import type { EmailTemplate } from "./email.types.js";
export declare class emailTemplates {
    static forgotPasswordOtpTemplate: (otp: string) => EmailTemplate;
    static verifyEmailOtpTemplate: (otp: string, name: string) => EmailTemplate;
}
//# sourceMappingURL=email.templates.d.ts.map