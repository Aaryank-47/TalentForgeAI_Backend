import { CompanyMemberRole, CompanyMemberStatus } from "@prisma/client";
import { companySelect } from "../../../common/prisma.select/company.select.js";
import { type Prisma } from "@prisma/client"


export interface CreateCompanyInput {
    userId: string;
    companyName: string;
    slug: string;
    companyEmail?: string | undefined;
    website?: string | undefined;
    phoneNumber?: string | undefined;
}

export interface UpdateCompanyInput {
    companyEmail?: string;
    website?: string;
    phoneNumber?: string;
    logo?: string;
    coverImage?: string;
    description?: string;
    industry?: string;
    companySize?: string;
    foundedYear?: number;
    headquarters?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    profileCompletion?: number;
    deletedAt?:Date|null;
}


export interface CompanyMemberList {
    id: string
    userId: string
    role: CompanyMemberRole
    status: CompanyMemberStatus
    companyId: string
    joinedAt: Date
    invitedBy: string | null
}

export interface CompanyMemberDetails extends CompanyMemberList {
    user: {
        email: string;
        candidate: {
            fullName: string;
        } | null;
        employer: {
            fullName: string;
        } | null;
    };
}

export interface InvitationTokenPayload {
    companyId: string;
    inviteeEmail: string;
    invitedBy: string;
    role: CompanyMemberRole;
    issuedAt?: number | undefined;
    expiration?: number | undefined;
}

export interface InvitationResponse {
    companyId: string;
    companyName: string;
    companyLogo: string | null;
    companyEmail: string | null;
    role: CompanyMemberRole;
    inviteeEmail: string;
    expiresAt: Date | null;
}

export interface RemoveCompanyMembersResponse {
    removedCount: number;
    removedMembers: CompanyMemberList[];
}

export type CompanyView = Prisma.CompanyGetPayload<{ select: typeof companySelect }>;

export interface UploadCompanyLogoResult {
    logo: string;
}

export interface UploadCompanyCoverResult {
    coverImage: string;
}

export interface CompanySearchView {
    id: string;
    companyName: string;
    slug: string;
    industry: string | null;
    description: string | null;
    headquarters: string | null;
    website: string | null;
    companySize: string | null;
    companyEmail: string | null;
    phoneNumber: string | null;
    logo: string | null;
    coverImage: string | null;
    foundedYear: number | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    status: string;
    visibility: string;
    isVerified: boolean;
    profileCompletion: number;
    createdAt: string;
    updatedAt: string;
}

export interface SearchCompanyResult {
    data: CompanySearchView[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}