import { env } from "../../config/env.js";
export class emailTemplates {
    static companyAddress = "123 Tech Lane, San Francisco, CA 94105"; // Replace with your actual physical address
    static baseUnsubscribeLink = `${env.app.frontendUrl}/unsubscribe`;
    static getFooterHtml(unsubscribeLink) {
        return `
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-family: Arial, sans-serif;">
                <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">
                    ${this.companyAddress}
                </p>
                <p style="font-size: 12px; color: #999; margin: 0;">
                    You are receiving this email because you interact with TalentForge. 
                    <br/>
                    <a href="${unsubscribeLink}" style="color: #0056b3; text-decoration: underline;">Unsubscribe from these emails</a>
                </p>
            </div>
        `;
    }
    static getFooterText(unsubscribeLink) {
        return `\n\n---\n${this.companyAddress}\nYou are receiving this email because you interact with TalentForge.\nUnsubscribe here: ${unsubscribeLink}`;
    }
    static forgotPasswordOtpTemplate = (otp) => {
        const unsubscribeLink = `${this.baseUnsubscribeLink}?type=security`;
        return {
            subject: "Password Reset Request",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 30px;">
                        <h1 style="font-size: 22px; color: #333; margin-top: 0;">Password Reset Request</h1>
                        <p>We received a request to reset your password. Use the following OTP to reset your password:</p>
                        <h2 style="color: #0056b3; font-size: 28px; letter-spacing: 2px;">${otp}</h2>
                        <p>If you did not request a password reset, please ignore this email.</p>
                    </div>
                    ${this.getFooterHtml(unsubscribeLink)}
                </div>
            `,
            text: `We received a request to reset your password. Use the following OTP to reset your password: ${otp}. If you did not request a password reset, please ignore this email.${this.getFooterText(unsubscribeLink)}`,
            unsubscribeLink
        };
    };
    static verifyEmailOtpTemplate = (otp, name) => {
        const unsubscribeLink = `${this.baseUnsubscribeLink}?type=security`;
        return {
            subject: "Verify Your Email",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 30px;">
                        <h1 style="font-size: 22px; color: #333; margin-top: 0;">Verify Your Email</h1>
                        <p>Hi ${name},</p>
                        <p>Welcome to TalentForge.</p>
                        <p>Use the following OTP to verify your email:</p>
                        <h2 style="color: #0056b3; font-size: 28px; letter-spacing: 2px;">${otp}</h2>
                        <p>This OTP expires in 5 minutes.</p>
                        <p>If you didn't create this account, ignore this email.</p>
                    </div>
                    ${this.getFooterHtml(unsubscribeLink)}
                </div>
            `,
            text: `Hi ${name}, Welcome to TalentForge. Use the following OTP to verify your email: ${otp}. This OTP expires in 5 minutes. If you didn't create this account, ignore this email.${this.getFooterText(unsubscribeLink)}`,
            unsubscribeLink
        };
    };
    static existingUserInvitationTemplate = (companyName, inviterName, role, invitationLink) => {
        const unsubscribeLink = `${this.baseUnsubscribeLink}?type=invitations`;
        return {
            subject: `You've been invited to join ${companyName} on TalentForge`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #0056b3; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">TalentForge</h2>
                    </div>
                    <div style="padding: 30px;">
                        <h1 style="font-size: 22px; color: #333; margin-top: 0;">Invitation to join ${companyName}</h1>
                        <p style="font-size: 16px;">Hello,</p>
                        <p style="font-size: 16px;"><strong>${inviterName}</strong> has invited you to join their team at <strong>${companyName}</strong> as a <strong>${role}</strong> on TalentForge.</p>
                        <p style="font-size: 16px; margin-bottom: 25px;">Please sign in to your TalentForge account to accept this invitation.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${invitationLink}" style="display: inline-block; background-color: #0056b3; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 12px 30px; border-radius: 6px;">Accept Invitation</a>
                        </div>
                        <p style="font-size: 14px; color: #666;">This invitation token will expire in 7 days for your security.</p>
                        <p style="font-size: 14px; color: #666;">If you were not expecting this invitation, you can safely ignore this email.</p>
                    </div>
                    ${this.getFooterHtml(unsubscribeLink)}
                </div>
            `,
            text: `You've been invited to join ${companyName}\n\nHello,\n${inviterName} has invited you to join ${companyName} as a ${role}.\n\nPlease sign in to your TalentForge account to accept this invitation:\n${invitationLink}\n\nThis invitation expires in 7 days.\nIf you did not expect this invitation, you can ignore this email.${this.getFooterText(unsubscribeLink)}`,
            unsubscribeLink
        };
    };
    static newUserInvitationTemplate = (companyName, inviterName, role, invitationLink) => {
        const unsubscribeLink = `${this.baseUnsubscribeLink}?type=invitations`;
        return {
            subject: `You've been invited to join ${companyName} on TalentForge`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #0056b3; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">TalentForge</h2>
                    </div>
                    <div style="padding: 30px;">
                        <h1 style="font-size: 22px; color: #333; margin-top: 0;">Invitation to join ${companyName}</h1>
                        <p style="font-size: 16px;">Hello,</p>
                        <p style="font-size: 16px;"><strong>${inviterName}</strong> has invited you to join their team at <strong>${companyName}</strong> as a <strong>${role}</strong>.</p>
                        <p style="font-size: 16px; margin-bottom: 25px;">Create your TalentForge account to accept this invitation.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${invitationLink}" style="display: inline-block; background-color: #0056b3; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 12px 30px; border-radius: 6px;">Create Account & Accept Invitation</a>
                        </div>
                        <p style="font-size: 14px; color: #666;">This invitation token will expire in 7 days for your security.</p>
                        <p style="font-size: 14px; color: #666;">If you were not expecting this invitation, you can safely ignore this email.</p>
                    </div>
                    ${this.getFooterHtml(unsubscribeLink)}
                </div>
            `,
            text: `You've been invited to join ${companyName}\n\nHello,\n${inviterName} has invited you to join ${companyName} as a ${role}.\n\nCreate your TalentForge account to accept this invitation:\n${invitationLink}\n\nThis invitation expires in 7 days.\nIf you did not expect this invitation, you can ignore this email.${this.getFooterText(unsubscribeLink)}`,
            unsubscribeLink
        };
    };
}
//# sourceMappingURL=email.templates.js.map