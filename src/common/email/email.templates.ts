import type { EmailTemplate } from "./email.types.js";

export class emailTemplates {
    static forgotPasswordOtpTemplate = (
        otp: string
    ): EmailTemplate => {
        return {
            subject: "Password Reset Request",
            html: `
                <h1>Password Reset Request</h1>
                <p>We received a request to reset your password. Use the following OTP to reset your password:</p>
                <h2>${otp}</h2>
                <p>If you did not request a password reset, please ignore this email.</p>
            `,
            text: `We received a request to reset your password. Use the following OTP to reset your password: ${otp}. If you did not request a password reset, please ignore this email.`,
        };
    }

    static verifyEmailOtpTemplate = (
        otp: string, name: string
    ): EmailTemplate => {
        return {
            subject: "Verify Your Email",
            html: `
                <h1>Verify Your Email</h1>
                <p>Hi ${name},</p>
                <p>Welcome to our platform! Please use the following OTP to verify your email address:</p>
                <h2>${otp}</h2>
                <p>If you did not create an account, please ignore this email.</p>
            `,
            text: `Hi ${name}, Welcome to our platform! Please use the following OTP to verify your email address: ${otp}. If you did not create an account, please ignore this email.`,
        };
    }
}