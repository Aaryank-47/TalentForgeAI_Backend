import { z } from "zod";
export declare class CandidateDto {
    static registerUser: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
        fullName: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static registerCandidate: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
        fullName: z.ZodString;
    }, z.core.$strip>;
    static login: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
    }, z.core.$strip>;
    static logoutAllDevices: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
    }, z.core.$strip>;
    static changePassword: z.ZodObject<{
        oldPassword: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
    static forgotPassword: z.ZodObject<{
        email: z.ZodEmail;
    }, z.core.$strip>;
    static verifyOtp: z.ZodObject<{
        email: z.ZodEmail;
        otp: z.ZodString;
    }, z.core.$strip>;
    static resetPassword: z.ZodObject<{
        token: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
    static verifyEmail: z.ZodObject<{
        email: z.ZodEmail;
        otp: z.ZodString;
    }, z.core.$strip>;
    static resendVerification: z.ZodObject<{
        email: z.ZodEmail;
    }, z.core.$strip>;
}
export type RegisterUserDto = z.infer<typeof CandidateDto.registerUser>;
export type RegisterCandidateDto = z.infer<typeof CandidateDto.registerCandidate>;
export type LoginDto = z.infer<typeof CandidateDto.login>;
export type LogoutAllDevicesDto = z.infer<typeof CandidateDto.logoutAllDevices>;
export type ChangePasswordDto = z.infer<typeof CandidateDto.changePassword>;
export type ForgotPasswordDto = z.infer<typeof CandidateDto.forgotPassword>;
export type VerifyOtpDto = z.infer<typeof CandidateDto.verifyOtp>;
export type ResetPasswordDto = z.infer<typeof CandidateDto.resetPassword>;
export type VerifyEmailDto = z.infer<typeof CandidateDto.verifyEmail>;
export type ResendVerificationDto = z.infer<typeof CandidateDto.resendVerification>;
//# sourceMappingURL=Candidate.dto.d.ts.map