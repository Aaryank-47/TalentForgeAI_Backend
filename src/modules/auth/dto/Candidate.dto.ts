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