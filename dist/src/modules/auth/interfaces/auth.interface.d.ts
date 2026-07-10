import type { AccountStatus, UserRole } from "@prisma/client";
import type { CandidateProfileView } from "../../candidate/interfaces/candidate.interface.js";
import type { EmployerCompanyInput, EmployerCompanyView, EmployerProfileView } from "../../employer/interfaces/employer.interface.js";
export interface AuthTokenPayload {
    id: string;
    email: string;
    role: UserRole;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthUserView {
    id: string;
    email: string;
    role: UserRole;
    status: AccountStatus;
    isEmailVerified: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface RegisterCandidateInput {
    email: string;
    password: string;
    fullName: string;
}
export interface CandidateRegistrationView {
    id: string;
    userId: string;
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoginCandidateInput {
    email: string;
    password: string;
}
export interface CandidateLoginView {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    accessToken: string;
    lastLoginAt: Date | null;
}
export interface EmployerLoginView {
    id: string;
    userId: string;
    fullName: string;
}
export interface CandidateLoginProfileView {
    id: string;
    userId: string;
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface EmployerLoginProfileView {
    id: string;
    userId: string;
    fullName: string;
    phoneNumber: string | null;
    designation: string | null;
    department: string | null;
    profilePicture: string | null;
    linkedinUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoginResult {
    user: AuthUserView;
    profile: CandidateLoginProfileView | EmployerLoginProfileView | null;
    tokens: AuthTokens;
}
export interface RegisterEmployerInput {
    email: string;
    password: string;
    fullName: string;
    companyId: string;
}
export interface RegisterCandidateResult {
    user: AuthUserView;
    candidate: CandidateRegistrationView;
    tokens: AuthTokens;
}
export interface RegisterEmployerResult {
    user: AuthUserView;
    employer: EmployerProfileView;
    tokens: AuthTokens;
}
export interface RegisterCompanyOwnerInput {
    email: string;
    password: string;
    fullName: string;
    company: EmployerCompanyInput;
}
export interface RegisterCompanyOwnerResult {
    user: AuthUserView;
    company: EmployerCompanyView;
    employer: EmployerProfileView;
    tokens: AuthTokens;
}
export interface ProfileResult {
    user: AuthUserView;
    profile: CandidateProfileView | EmployerProfileView | null;
}
export interface ProfileViewResult {
    profile: CandidateProfileView | EmployerProfileView | null;
}
//# sourceMappingURL=auth.interface.d.ts.map