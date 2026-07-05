import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";

export const registerCandidateDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    fullName: z.string().trim().min(1, "Full name is required").max(100)
});

export type RegisterCandidateDto = z.infer<typeof registerCandidateDto>;

export const loginDto = z.object({
    email: emailValidator,
    password: passwordValidator
});

export type LoginDto = z.infer<typeof loginDto>;

export const logoutAllDevicesDto = z.object({
    email: emailValidator,
    password: passwordValidator
});

export type LogoutAllDevicesDto = z.infer<typeof logoutAllDevicesDto>;

export const changePasswordDto = z.object({
    oldPassword: passwordValidator,
    newPassword: passwordValidator
});

export type ChangePasswordDto = z.infer<typeof changePasswordDto>;

export const forgotPasswordDto = z.object({
    email: emailValidator
})

export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;

export const verifyOtpDto = z.object({
    email: emailValidator,
    otp: z.string().length(6, "OTP must be 6 digits"),
})

export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;

export const resetPasswordDto = z.object({
    token: z.string().min(1, "Reset password token is required"),
    newPassword: passwordValidator
});

export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;

export const verifyEmailDto = z.object({
    email: emailValidator,
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailDto>;

export const resendVerificationDto = z.object({
    email: emailValidator,
});

export type ResendVerificationDto = z.infer<typeof resendVerificationDto>;