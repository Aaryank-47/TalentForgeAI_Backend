import type { AccountStatus, ExperienceLevel, Gender, UserRole } from "@prisma/client";
import type { CandidateProfileView } from "../../candidate/interfaces/candidate.interface.js";
import type { RecruiterCompanyInput, RecruiterCompanyView, RecruiterProfileView } from "../../recruiter/interfaces/recruiter.interface.js";

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
    fullName: string
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
    password: string
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

export interface RecruiterLoginView {
    id: string;
    userId: string;
    companyId: string;
    firstName: string;
    lastName: string;
}

export interface CandidateLoginProfileView {
    id: string;
    userId: string;
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RecruiterLoginProfileView {
    id: string;
    userId: string;
    companyId: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    designation: string | null;
    department: string | null;
    profilePicture: string | null;
    linkedinUrl: string | null;
    isPrimaryRecruiter: boolean;
    canCreateJobs: boolean;
    canEditJobs: boolean;
    canDeleteJobs: boolean;
    canScheduleInterview: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginResult {
    user: AuthUserView;
    profile: CandidateLoginProfileView | RecruiterLoginProfileView | null;
    tokens: AuthTokens;
}


export interface RegisterRecruiterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId: string;
}

export interface RegisterCandidateResult {
    user: AuthUserView;
    candidate: CandidateRegistrationView;
    tokens: AuthTokens;
}

export interface RegisterRecruiterResult {
    user: AuthUserView;
    recruiter: RecruiterProfileView;
    tokens: AuthTokens;
}

export interface RegisterCompanyOwnerInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company: RecruiterCompanyInput;
}

export interface RegisterCompanyOwnerResult {
    user: AuthUserView;
    company: RecruiterCompanyView;
    recruiter: RecruiterProfileView;
    tokens: AuthTokens;
}

export interface ProfileResult {
    user: AuthUserView;
    profile: CandidateProfileView | RecruiterProfileView | null;
}

export interface ProfileViewResult {
    profile: CandidateProfileView | RecruiterProfileView | null;
}