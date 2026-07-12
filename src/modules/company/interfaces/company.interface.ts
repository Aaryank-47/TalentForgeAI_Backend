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
}


export interface CompanyMemberList {
    id: string
    userId: string
    role: CompanyMemberRole
    status: CompanyMemberStatus
    companyId: string
    joinedAt: Date
    invitedBy: string
}