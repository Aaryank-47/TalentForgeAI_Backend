import { CompanyMemberRole, CompanyMemberStatus } from "@prisma/client";

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