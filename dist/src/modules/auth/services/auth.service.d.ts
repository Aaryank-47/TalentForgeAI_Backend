import type { RegisterCandidateDto, RegisterUserDto, VerifyOtpDto, VerifyEmailDto, ResendVerificationDto, SendOtpLoginDto, VerifyOtpLoginDto, ForceOtpLoginDto } from "../dto/Candidate.dto.js";
import type { RegisterEmployerDtoType } from "../dto/Employer.dto.js";
import type { RegisterCompanyOwnerDtoType } from "../dto/registerCompanyOwner.dto.js";
import type { RegisterCandidateResult, RegisterUserResult, RegisterEmployerResult, RegisterCompanyOwnerResult, LoginResult, UpdateEmployerProfileInput, UpdateEmployerProfileResult } from "../interfaces/auth.interface.js";
import type { LoginDto } from "../dto/Candidate.dto.js";
import type { AuthTokens } from "../interfaces/auth.interface.js";
import type { LogoutAllDevicesDto } from "../dto/Candidate.dto.js";
import type { ProfileResult } from "../interfaces/auth.interface.js";
export declare class AuthService {
    private static redisClient;
    static registerUser(payload: RegisterUserDto): Promise<RegisterUserResult>;
    static registerCandidate(payload: RegisterCandidateDto): Promise<RegisterCandidateResult>;
    static login(payload: LoginDto): Promise<LoginResult>;
    static newRefreshToken(refreshToken: string): Promise<AuthTokens>;
    static logout(refreshToken: string): Promise<void>;
    static logoutAllDevices(userId: string): Promise<void>;
    static logoutAllDevicesByEmail(payload: LogoutAllDevicesDto): Promise<void>;
    static getMe(userId: string): Promise<ProfileResult>;
    static changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    static forgotPassword(email: string): Promise<void>;
    static verifyOtp(payload: VerifyOtpDto): Promise<string>;
    static resetPassword(resetPasswordToken: string, newPassword: string): Promise<void>;
    static registerEmployer(payload: RegisterEmployerDtoType): Promise<RegisterEmployerResult>;
    static registerCompanyOwner(payload: RegisterCompanyOwnerDtoType): Promise<RegisterCompanyOwnerResult>;
    static verifyEmail(payload: VerifyEmailDto): Promise<void>;
    static resendVerificationEmail(payload: ResendVerificationDto): Promise<void>;
    static sendOtpLogin(payload: SendOtpLoginDto): Promise<void>;
    static verifyOtpLogin(payload: VerifyOtpLoginDto): Promise<LoginResult>;
    /**
     * Force-login via OTP: verifies OTP, logs out ALL existing sessions for the
     * user, then issues fresh tokens for the current device.
     * Used when the device-limit is reached and the user wants to sign in anyway.
     */
    static forceOtpLogin(payload: ForceOtpLoginDto): Promise<LoginResult>;
    static updateEmployerProfile(userId: string, payload: UpdateEmployerProfileInput): Promise<UpdateEmployerProfileResult>;
}
//# sourceMappingURL=auth.service.d.ts.map