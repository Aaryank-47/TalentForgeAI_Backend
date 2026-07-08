import type { CandidateRegistrationView, ProfileViewResult } from "../interfaces/auth.interface.js";
import type { EmployerCompanyInput, EmployerCompanyView, EmployerProfileView } from "../../employer/interfaces/employer.interface.js";
import type { RegisterCandidateInput, RegisterEmployerInput, RegisterCompanyOwnerInput, AuthUserView } from "../interfaces/auth.interface.js";
export declare class AuthRepository {
    static findUserByEmail(email: string): Promise<AuthUserView | null>;
    static findLoginUserByEmail(email: string): Promise<{
        email: string;
        password: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        candidate: {
            fullName: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        } | null;
        employer: {
            fullName: string;
            phone: string | null;
            linkedinUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profilePicture: string | null;
            designation: string | null;
            department: string | null;
            isActive: boolean;
        } | null;
    } | null>;
    static findUserById(userId: string): Promise<AuthUserView | null>;
    static findUserWithPasswordById(userId: string): Promise<{
        password: string;
        id: string;
    } | null>;
    static findProfileByUserId(userId: string): Promise<ProfileViewResult>;
    static updateUserLastLogin(userId: string, lastLoginAt: Date): Promise<{
        email: string;
        password: string;
        otp: string | null;
        id: string;
        otpExpiresAt: Date | null;
        resetPasswordToken: string | null;
        resetPasswordTokenExpiresAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static updateUserPassword(userId: string, newPassword: string): Promise<{
        email: string;
        password: string;
        otp: string | null;
        id: string;
        otpExpiresAt: Date | null;
        resetPasswordToken: string | null;
        resetPasswordTokenExpiresAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static findRefreshToken(token: string): Promise<{
        token: string;
        userId: string;
        expiresAt: Date;
    } | null>;
    static deleteRefreshToken(token: string): Promise<{
        token: string;
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        revokedAt: Date | null;
    }>;
    static calcLoggedinDevices(userId: string): Promise<number>;
    static deleteAllRefreshTokensForUser(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static saveOTP(userId: string, otp: string, otpExpiresAt: Date): Promise<{
        email: string;
        password: string;
        otp: string | null;
        id: string;
        otpExpiresAt: Date | null;
        resetPasswordToken: string | null;
        resetPasswordTokenExpiresAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static findOTPByUserId(userId: string): Promise<{
        otp: string | null;
        otpExpiresAt: Date | null;
    } | null>;
    static deleteOtpForUser(userId: string): Promise<{
        email: string;
        password: string;
        otp: string | null;
        id: string;
        otpExpiresAt: Date | null;
        resetPasswordToken: string | null;
        resetPasswordTokenExpiresAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static markEmailVerified(userId: string): Promise<{
        email: string;
        password: string;
        otp: string | null;
        id: string;
        otpExpiresAt: Date | null;
        resetPasswordToken: string | null;
        resetPasswordTokenExpiresAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static saveResetPasswordToken(userId: string, resetPasswordToken: string, resetPasswordTokenExpiresAt: Date): Promise<{
        email: string;
        password: string;
        otp: string | null;
        id: string;
        otpExpiresAt: Date | null;
        resetPasswordToken: string | null;
        resetPasswordTokenExpiresAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static findResetPasswordTokenByUserId(userId: string): Promise<{
        resetPasswordToken: string | null;
        resetPasswordTokenExpiresAt: Date | null;
    } | null>;
    static deleteResetPasswordTokenForUser(userId: string): Promise<{
        email: string;
        password: string;
        otp: string | null;
        id: string;
        otpExpiresAt: Date | null;
        resetPasswordToken: string | null;
        resetPasswordTokenExpiresAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static updateNewPasswordForUser(userId: string, newPassword: string): Promise<void>;
    static createCandidateRegistration(data: RegisterCandidateInput): Promise<{
        user: AuthUserView;
        candidate: CandidateRegistrationView;
    }>;
    static findCompanyById(companyId: string): Promise<EmployerCompanyView | null>;
    static createCompany(companyInput: EmployerCompanyInput): Promise<EmployerCompanyView>;
    static createEmployerRegistration(data: RegisterEmployerInput): Promise<{
        user: AuthUserView;
        employer: EmployerProfileView;
    }>;
    static createCompanyOwnerRegistration(data: RegisterCompanyOwnerInput): Promise<{
        user: AuthUserView;
        company: EmployerCompanyView;
        employer: EmployerProfileView;
    }>;
    static saveRefreshToken(data: {
        token: string;
        userId: string;
        expiresAt: Date;
    }): Promise<{
        token: string;
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        revokedAt: Date | null;
    }>;
}
//# sourceMappingURL=auth.repository.d.ts.map