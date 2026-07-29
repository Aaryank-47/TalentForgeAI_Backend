import { z } from "zod";
export declare class CompanyDto {
    static createCompany: z.ZodObject<{
        companyName: z.ZodString;
        companyEmail: z.ZodOptional<z.ZodEmail>;
        website: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        phoneNumber: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static companyIdParam: z.ZodObject<{
        companyId: z.ZodString;
    }, z.core.$strip>;
    static updateCompany: z.ZodObject<{
        companyEmail: z.ZodOptional<z.ZodEmail>;
        website: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        phoneNumber: z.ZodOptional<z.ZodString>;
        logo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        coverImage: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        industry: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        companySize: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        foundedYear: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        headquarters: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        linkedinUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        twitterUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        visibility: z.ZodOptional<z.ZodEnum<{
            PUBLIC: "PUBLIC";
            PRIVATE: "PRIVATE";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            DRAFT: "DRAFT";
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
            SUSPENDED: "SUSPENDED";
        }>>;
    }, z.core.$strip>;
    static deleteCompany: z.ZodObject<{
        companyId: z.ZodString;
        userId: z.ZodString;
    }, z.core.$strip>;
    static sendInvitation: z.ZodObject<{
        inviterId: z.ZodString;
        inviteeEmail: z.ZodEmail;
        role: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            OWNER: "OWNER";
            ADMIN: "ADMIN";
            RECRUITER: "RECRUITER";
            HIRING_MANAGER: "HIRING_MANAGER";
        }>>>;
    }, z.core.$strip>;
    static getCompanyInvitationToken: z.ZodObject<{
        token: z.ZodString;
    }, z.core.$strip>;
    static acceptOrRejectInvitation: z.ZodObject<{
        token: z.ZodString;
        action: z.ZodString;
    }, z.core.$strip>;
    static updateCompanyMemberRole: z.ZodObject<{
        role: z.ZodEnum<{
            OWNER: "OWNER";
            ADMIN: "ADMIN";
            RECRUITER: "RECRUITER";
            HIRING_MANAGER: "HIRING_MANAGER";
        }>;
    }, z.core.$strip>;
    static removeCompanyMembers: z.ZodObject<{
        userIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    static searchCompany: z.ZodObject<{
        keyword: z.ZodOptional<z.ZodString>;
        industry: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        companySize: z.ZodOptional<z.ZodString>;
        page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            companyName: "companyName";
            foundedYear: "foundedYear";
            createdAt: "createdAt";
            profileCompletion: "profileCompletion";
        }>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>>;
    }, z.core.$strip>;
    static suspendCompany: z.ZodObject<{
        reason: z.ZodString;
    }, z.core.$strip>;
    static cancelInvitationParam: z.ZodObject<{
        invitationId: z.ZodString;
    }, z.core.$strip>;
    static resendInvitationParam: z.ZodObject<{
        invitationId: z.ZodString;
    }, z.core.$strip>;
}
export type CreateCompanyDto = z.infer<typeof CompanyDto.createCompany>;
export type CompanyIdParamDto = z.infer<typeof CompanyDto.companyIdParam>;
export type UpdateCompanyDto = z.infer<typeof CompanyDto.updateCompany>;
export type DeleteCompanyDto = z.infer<typeof CompanyDto.deleteCompany>;
export type SendInvitationDto = z.infer<typeof CompanyDto.sendInvitation>;
export type GetCompanyInvitationTokenDto = z.infer<typeof CompanyDto.getCompanyInvitationToken>;
export type AcceptOrRejectInvitationDto = z.infer<typeof CompanyDto.acceptOrRejectInvitation>;
export type UpdateCompanyMemberRoleDto = z.infer<typeof CompanyDto.updateCompanyMemberRole>;
export type RemoveCompanyMembersDto = z.infer<typeof CompanyDto.removeCompanyMembers>;
export type SearchCompanyDto = z.infer<typeof CompanyDto.searchCompany>;
export type SuspendCompanyDto = z.infer<typeof CompanyDto.suspendCompany>;
export type CancelInvitationParamDto = z.infer<typeof CompanyDto.cancelInvitationParam>;
export type ResendInvitationParamDto = z.infer<typeof CompanyDto.resendInvitationParam>;
//# sourceMappingURL=company.dto.d.ts.map