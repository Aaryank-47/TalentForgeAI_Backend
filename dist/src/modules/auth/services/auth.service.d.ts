import type { RegisterCandidateDto, VerifyOtpDto, VerifyEmailDto, ResendVerificationDto } from "../dto/Candidate.dto.js";
import type { RegisterEmployerDto } from "../dto/registerEmployer.dto.js";
import type { RegisterCompanyOwnerDto } from "../dto/registerCompanyOwner.dto.js";
import type { RegisterCandidateResult, RegisterEmployerResult, RegisterCompanyOwnerResult, LoginResult } from "../interfaces/auth.interface.js";
import type { LoginDto } from "../dto/Candidate.dto.js";
import type { AuthTokens } from "../interfaces/auth.interface.js";
import type { LogoutAllDevicesDto } from "../dto/Candidate.dto.js";
import type { ProfileResult } from "../interfaces/auth.interface.js";
export declare class AuthService {
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
    static registerEmployer(payload: RegisterEmployerDto): Promise<RegisterEmployerResult>;
    static registerCompanyOwner(payload: RegisterCompanyOwnerDto): Promise<RegisterCompanyOwnerResult>;
    static verifyEmail(payload: VerifyEmailDto): Promise<void>;
    static resendVerificationEmail(payload: ResendVerificationDto): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map