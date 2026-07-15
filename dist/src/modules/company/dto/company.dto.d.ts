import { z } from "zod";
export declare const createCompanyDto: z.ZodObject<{
    companyName: z.ZodString;
    companyEmail: z.ZodOptional<z.ZodEmail>;
    website: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phoneNumber: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateCompanyDto = z.infer<typeof createCompanyDto>;
export declare const companyIdParamDto: z.ZodObject<{
    companyId: z.ZodString;
}, z.core.$strip>;
export type CompanyIdParamDto = z.infer<typeof companyIdParamDto>;
export declare const updateCompanyDto: z.ZodObject<{
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
export type UpdateCompanyDto = z.infer<typeof updateCompanyDto>;
export declare const deleteCompanyDto: z.ZodObject<{
    companyId: z.ZodString;
    userId: z.ZodString;
}, z.core.$strip>;
export type DeleteCompanyDto = z.infer<typeof deleteCompanyDto>;
export declare const sendInvitationDto: z.ZodObject<{
    inviterId: z.ZodString;
    inviteeEmail: z.ZodEmail;
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        RECRUITER: "RECRUITER";
        HIRING_MANAGER: "HIRING_MANAGER";
    }>>>;
}, z.core.$strip>;
export type SendInvitationDto = z.infer<typeof sendInvitationDto>;
export declare const getCompanyInvitationTokenDto: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export type GetCompanyInvitationTokenDto = z.infer<typeof getCompanyInvitationTokenDto>;
export declare const acceptOrRejectInvitationDto: z.ZodObject<{
    token: z.ZodString;
    action: z.ZodString;
}, z.core.$strip>;
export type AcceptOrRejectInvitationDto = z.infer<typeof acceptOrRejectInvitationDto>;
export declare const updateCompanyMemberRoleDto: z.ZodObject<{
    role: z.ZodEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        RECRUITER: "RECRUITER";
        HIRING_MANAGER: "HIRING_MANAGER";
    }>;
}, z.core.$strip>;
export type UpdateCompanyMemberRoleDto = z.infer<typeof updateCompanyMemberRoleDto>;
export declare const removeCompanyMembersDto: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type RemoveCompanyMembersDto = z.infer<typeof removeCompanyMembersDto>;
export declare const searchCompanyDto: z.ZodObject<{
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
export type SearchCompanyDto = z.infer<typeof searchCompanyDto>;
export declare const suspendCompanyDto: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export type SuspendCompanyDto = z.infer<typeof suspendCompanyDto>;
export declare const cancelInvitationParamDto: z.ZodObject<{
    invitationId: z.ZodString;
}, z.core.$strip>;
export type CancelInvitationParamDto = z.infer<typeof cancelInvitationParamDto>;
export declare const resendInvitationParamDto: z.ZodObject<{
    invitationId: z.ZodString;
}, z.core.$strip>;
export type ResendInvitationParamDto = z.infer<typeof resendInvitationParamDto>;
//# sourceMappingURL=company.dto.d.ts.map