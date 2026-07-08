import { z } from "zod";
export declare const registerCandidateDto: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    fullName: z.ZodString;
}, z.core.$strip>;
export type RegisterCandidateDto = z.infer<typeof registerCandidateDto>;
export declare const loginDto: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginDto = z.infer<typeof loginDto>;
export declare const logoutAllDevicesDto: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type LogoutAllDevicesDto = z.infer<typeof logoutAllDevicesDto>;
export declare const changePasswordDto: z.ZodObject<{
    oldPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export type ChangePasswordDto = z.infer<typeof changePasswordDto>;
export declare const forgotPasswordDto: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export declare const verifyOtpDto: z.ZodObject<{
    email: z.ZodEmail;
    otp: z.ZodString;
}, z.core.$strip>;
export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;
export declare const resetPasswordDto: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
export declare const verifyEmailDto: z.ZodObject<{
    email: z.ZodEmail;
    otp: z.ZodString;
}, z.core.$strip>;
export type VerifyEmailDto = z.infer<typeof verifyEmailDto>;
export declare const resendVerificationDto: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;
export type ResendVerificationDto = z.infer<typeof resendVerificationDto>;
//# sourceMappingURL=Candidate.dto.d.ts.map