import type { AccountStatus, ExperienceLevel, Gender, UserRole } from "@prisma/client";
import type { CandidateProfileView } from "../../candidate/interfaces/candidate.interface.js";
import type { RecruiterCompanyInput, RecruiterCompanyView, RecruiterProfileView } from "../../recruiter/interfaces/recruiter.interface.js";
export interface AuthTokenPayload {
    id: string;
    email: string;
    role: UserRole;
    companyId?: string | undefined;
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
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    profilePicture?: string | undefined;
    headline?: string | undefined;
    bio?: string | undefined;
    gender?: Gender | undefined;
    experienceLevel?: ExperienceLevel | undefined;
    currentLocation?: string | undefined;
    preferredLocation?: string | undefined;
    currentCompany?: string | undefined;
    currentDesignation?: string | undefined;
    totalExperience?: number | undefined;
    expectedSalary?: number | undefined;
    currentSalary?: number | undefined;
    noticePeriod?: number | undefined;
    linkedinUrl?: string | undefined;
    githubUrl?: string | undefined;
    portfolioUrl?: string | undefined;
    websiteUrl?: string | undefined;
    isOpenToWork?: boolean | undefined;
}
export interface RegisterRecruiterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    designation?: string | undefined;
    department?: string | undefined;
    profilePicture?: string | undefined;
    linkedinUrl?: string | undefined;
    isPrimaryRecruiter?: boolean | undefined;
    canCreateJobs?: boolean | undefined;
    canEditJobs?: boolean | undefined;
    canDeleteJobs?: boolean | undefined;
    canScheduleInterview?: boolean | undefined;
    companyId?: string | undefined;
    company?: RecruiterCompanyInput | undefined;
}
export interface RegisterCandidateResult {
    user: AuthUserView;
    candidate: CandidateProfileView;
    tokens: AuthTokens;
}
export interface RegisterRecruiterResult {
    user: AuthUserView;
    company: RecruiterCompanyView;
    recruiter: RecruiterProfileView;
    tokens: AuthTokens;
}
//# sourceMappingURL=auth.interface.d.ts.map