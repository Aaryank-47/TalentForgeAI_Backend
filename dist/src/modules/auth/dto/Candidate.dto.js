import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";
export const registerCandidateDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    fullName: z.string().trim().min(1, "Full name is required").max(100)
});
export const loginDto = z.object({
    email: emailValidator,
    password: passwordValidator
});
export const logoutAllDevicesDto = z.object({
    email: emailValidator,
    password: passwordValidator
});
export const changePasswordDto = z.object({
    oldPassword: passwordValidator,
    newPassword: passwordValidator
});
export const forgotPasswordDto = z.object({
    email: emailValidator
});
export const verifyOtpDto = z.object({
    email: emailValidator,
    otp: z.string().length(6, "OTP must be 6 digits"),
});
export const resetPasswordDto = z.object({
    token: z.string().min(1, "Reset password token is required"),
    newPassword: passwordValidator
});
export const verifyEmailDto = z.object({
    email: emailValidator,
    otp: z.string().length(6, "OTP must be 6 digits"),
});
export const resendVerificationDto = z.object({
    email: emailValidator,
});
//# sourceMappingURL=Candidate.dto.js.map