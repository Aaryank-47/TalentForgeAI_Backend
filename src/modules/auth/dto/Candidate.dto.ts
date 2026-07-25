import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";

export class CandidateDto {
    static registerCandidate = z.object({
        email: emailValidator,
        password: passwordValidator,
        fullName: z.string().trim().min(1, "Full name is required").max(100)
    });

    static login = z.object({
        email: emailValidator,
        password: passwordValidator
    });

    static logoutAllDevices = z.object({
        email: emailValidator,
        password: passwordValidator
    });

    static changePassword = z.object({
        oldPassword: passwordValidator,
        newPassword: passwordValidator
    });

    static forgotPassword = z.object({
        email: emailValidator
    });

    static verifyOtp = z.object({
        email: emailValidator,
        otp: z.string().length(6, "OTP must be 6 digits"),
    });

    static resetPassword = z.object({
        token: z.string().min(1, "Reset password token is required"),
        newPassword: passwordValidator
    });

    static verifyEmail = z.object({
        email: emailValidator,
        otp: z.string().length(6, "OTP must be 6 digits"),
    });

    static resendVerification = z.object({
        email: emailValidator,
    });
}

export type RegisterCandidateDto = z.infer<typeof CandidateDto.registerCandidate>;
export type LoginDto = z.infer<typeof CandidateDto.login>;
export type LogoutAllDevicesDto = z.infer<typeof CandidateDto.logoutAllDevices>;
export type ChangePasswordDto = z.infer<typeof CandidateDto.changePassword>;
export type ForgotPasswordDto = z.infer<typeof CandidateDto.forgotPassword>;
export type VerifyOtpDto = z.infer<typeof CandidateDto.verifyOtp>;
export type ResetPasswordDto = z.infer<typeof CandidateDto.resetPassword>;
export type VerifyEmailDto = z.infer<typeof CandidateDto.verifyEmail>;
export type ResendVerificationDto = z.infer<typeof CandidateDto.resendVerification>;