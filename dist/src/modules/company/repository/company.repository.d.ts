import { companySelect } from "../../../common/prisma.select/company.select.js";
import { CompanyMemberRole, type Prisma } from "@prisma/client";
import type { CreateCompanyInput, UpdateCompanyInput, CompanyMemberList, CompanyMemberDetails, RemoveCompanyMembersResponse, CompanyInvitationView, InvitationView, CancelInvitationResult, ResendInvitationResult } from "../interfaces/company.interface.js";
import type { Company } from "@prisma/client";
export type CompanyView = Prisma.CompanyGetPayload<{
    select: typeof companySelect;
}>;
export declare class CompanyRepository {
    static findCompanyBySlug(slug: string): Promise<Company | null>;
    static createCompany(input: CreateCompanyInput): Promise<CompanyView>;
    static getMyCompanies(userId: string): Promise<CompanyView[]>;
    static findCompanyById(companyId: string): Promise<CompanyView | null>;
    static findCompanyMemberById(companyMemberId: string): Promise<{
        companyId: string;
        id: string;
        role: import("@prisma/client").$Enums.CompanyMemberRole;
        status: import("@prisma/client").$Enums.CompanyMemberStatus;
        userId: string;
        expiresAt: Date | null;
        joinedAt: Date;
        invitationToken: string | null;
        invitedAt: Date | null;
        invitedBy: string | null;
    } | null>;
    static findMemberByUserAndCompany(userId: string, companyId: string): Promise<{
        companyId: string;
        id: string;
        role: import("@prisma/client").$Enums.CompanyMemberRole;
        status: import("@prisma/client").$Enums.CompanyMemberStatus;
        userId: string;
        expiresAt: Date | null;
        joinedAt: Date;
        invitationToken: string | null;
        invitedAt: Date | null;
        invitedBy: string | null;
    } | null>;
    static updateCompanyProfile(companyId: string, input: UpdateCompanyInput): Promise<CompanyView>;
    static getRawCompanyById(companyId: string): Promise<Company | null>;
    static membership(companyId: string, userId: string): Promise<CompanyMemberList | null>;
    static deleteCompany(companyId: string, userId: string): Promise<CompanyView>;
    static createInvitedMember(data: {
        userId: string;
        companyId: string;
        role: CompanyMemberRole;
        invitedBy: string;
    }): Promise<CompanyMemberList>;
    static listAllInvitations(companyId: string): Promise<CompanyInvitationView[]>;
    static updateMembership(membershipId: string, data: Prisma.CompanyMemberUpdateInput): Promise<CompanyMemberList>;
    static listAllMembers(companyId: string): Promise<CompanyMemberDetails[]>;
    static removeMember(companyId: string, userIds: string[]): Promise<RemoveCompanyMembersResponse>;
    static findMembersByUserIds(companyId: string, userIds: string[]): Promise<CompanyMemberList[]>;
    static updateLogo(companyId: string, logoUrl: string): Promise<CompanyView>;
    static updateCoverImage(companyId: string, coverUrl: string): Promise<CompanyView>;
    static verifyCompany(companyId: string, verifiedBy: string): Promise<CompanyView>;
    static suspendCompany(companyId: string, suspendedBy: string, reason: string): Promise<CompanyView>;
    static restoreCompany(companyId: string, restoredBy: string): Promise<CompanyView>;
    static getAllCompanies(): Promise<CompanyView[]>;
    static findInvitationById(invitationId: string): Promise<InvitationView | null>;
    static cancelInvitation(invitationId: string): Promise<CancelInvitationResult>;
    static updateInvitationToken(invitationId: string, token: string, expiresAt: Date): Promise<ResendInvitationResult>;
    static deactivateCompany(companyId: string): Promise<CompanyView>;
    static activateCompany(companyId: string): Promise<CompanyView>;
}
//# sourceMappingURL=company.repository.d.ts.map