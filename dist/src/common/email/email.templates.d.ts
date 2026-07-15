import type { EmailTemplate } from "./email.types.js";
export declare class emailTemplates {
    private static readonly companyAddress;
    private static readonly baseUnsubscribeLink;
    private static getFooterHtml;
    private static getFooterText;
    static forgotPasswordOtpTemplate: (otp: string) => EmailTemplate;
    static verifyEmailOtpTemplate: (otp: string, name: string) => EmailTemplate;
    static existingUserInvitationTemplate: (companyName: string, inviterName: string, role: string, invitationLink: string) => EmailTemplate;
    static newUserInvitationTemplate: (companyName: string, inviterName: string, role: string, invitationLink: string) => EmailTemplate;
}
//# sourceMappingURL=email.templates.d.ts.map