import type { AccountStatus, UserRole } from "@prisma/client";
import type { CandidateProfileView } from "../../candidate/interfaces/candidate.interface.js";

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

export interface RegisterUserInput {
    email: string;
    password: string;
    fullName?: string | undefined;
}

export interface RegisterUserResult {
    user: AuthUserView;
    tokens: AuthTokens;
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

export interface WorkspaceCompanyView {
    id: string;
    companyId: string;
    role: string;
    status: string;
    company: {
        id: string;
        companyName: string;
        slug: string;
        logo: string | null;
        industry: string | null;
        companySize: string | null;
        headquarters: string | null;
        website?: string | null | undefined;
        description?: string | null | undefined;
        companyEmail?: string | null | undefined;
        phoneNumber?: string | null | undefined;
    };
}

export interface ProfileResult {
    user: AuthUserView;
    profile: CandidateProfileView | EmployerProfileView | null;
    capabilities?: {
        candidate: boolean;
        employer: boolean;
    } | undefined;
    candidate?: {
        enabled: boolean;
        id: string;
        fullName: string;
    } | null | undefined;
    companies?: WorkspaceCompanyView[] | undefined;
}

export interface ProfileViewResult {
    profile: CandidateProfileView | EmployerProfileView | null;
    capabilities?: {
        candidate: boolean;
        employer: boolean;
    } | undefined;
    candidate?: {
        enabled: boolean;
        id: string;
        fullName: string;
    } | null | undefined;
    companies?: WorkspaceCompanyView[] | undefined;
}

export interface EmployerCompanyInput {
    companyName: string;
    slug?: string | undefined;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    website?: string | undefined;
    logo?: string | undefined;
    coverImage?: string | undefined;
    description?: string | undefined;
    industry?: string | undefined;
    companySize?: string | undefined;
    foundedYear?: number | undefined;
    headquarters?: string | undefined;
    linkedinUrl?: string | undefined;
    twitterUrl?: string | undefined;
}

export interface EmployerCompanyView {
    id: string;
    companyName: string;
    slug: string;
    companyEmail: string | null;
    phoneNumber: string | null;
    website: string | null;
    logo: string | null;
    coverImage: string | null;
    description: string | null;
    industry: string | null;
    companySize: string | null;
    foundedYear: number | null;
    headquarters: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface EmployerProfileView {
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