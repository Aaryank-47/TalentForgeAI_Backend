import type { CreateCompanyDto, UpdateCompanyDto, SearchCompanyDto } from "../dto/company.dto.js";
import type { CompanyView } from "../repository/company.repository.js";
import { CompanyMemberRole } from "@prisma/client";
import type { InvitationResponse, CompanyMemberDetails, CompanyMemberList, RemoveCompanyMembersResponse, UploadCompanyLogoResult, UploadCompanyCoverResult, SearchCompanyResult, CompanyInvitationView, CancelInvitationResult, ResendInvitationResult, CompanyDeactivationResult, CompanyActivationResult } from "../interfaces/company.interface.js";
export declare class CompanyService {
    static createCompany(dto: CreateCompanyDto, userId: string): Promise<CompanyView>;
    static getCompanyMetadata(): Promise<{
        industries: readonly ["Technology & SaaS", "FinTech & Banking", "Healthcare & Life Sciences", "E-Commerce & Retail", "AI & Robotics", "Cybersecurity", "EdTech & Education", "Media & Entertainment", "Consulting & Professional Services", "Telecommunications", "Automotive & Mobility", "CleanTech & Energy", "Manufacturing & Industrial", "Other"];
        companySizes: readonly ["1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "501-1000 employees", "1000+ employees"];
    }>;
    static getMyCompanies(userId: string): Promise<CompanyView[]>;
    static getCompanyDetails(companyId: string): Promise<CompanyView>;
    static updateCompanyProfile(companyId: string, userId: string, dto: UpdateCompanyDto): Promise<CompanyView>;
    static deleteCompany(companyId: string, userId: string): Promise<void>;
    static sendInvitation(companyId: string, inviterId: string, inviteeEmail: string, role: CompanyMemberRole): Promise<{
        token: string;
        invitationId: string | null;
    }>;
    static getInvitation(token: string): Promise<InvitationResponse>;
    static acceptOrRejectInvitation(token: string, userId: string, action: string): Promise<void>;
    static getAllSentInvitation(companyId: string): Promise<CompanyInvitationView[]>;
    static listAllCompanyMembers(companyId: string): Promise<CompanyMemberDetails[]>;
    static updateCompanyMemberRole(companyId: string, userId: string, role: CompanyMemberRole): Promise<CompanyMemberList>;
    static removeCompanyMember(companyId: string, userIds: string[]): Promise<RemoveCompanyMembersResponse>;
    static uploadLogo(companyId: string, file: Express.Multer.File): Promise<UploadCompanyLogoResult>;
    static uploadCoverImage(companyId: string, file: Express.Multer.File): Promise<UploadCompanyCoverResult>;
    static searchCompanies(params: SearchCompanyDto): Promise<SearchCompanyResult>;
    private static getValidCompany;
    static verifyCompany(companyId: string, verifiedBy: string): Promise<CompanyView>;
    static suspendCompany(companyId: string, suspendedBy: string, reason: string): Promise<CompanyView>;
    static restoreCompany(companyId: string, restoredBy: string): Promise<CompanyView>;
    static getAllCompanies(): Promise<CompanyView[]>;
    static cancelInvitation(invitationId: string, userId: string): Promise<CancelInvitationResult>;
    static resendInvitation(invitationId: string, userId: string): Promise<ResendInvitationResult>;
    static deactivateCompany(companyId: string, userId: string): Promise<CompanyDeactivationResult>;
    static activateCompany(companyId: string, userId: string): Promise<CompanyActivationResult>;
}
//# sourceMappingURL=company.service.d.ts.map