import { z } from "zod";
import { CompanyMemberRole, CompanyVisibility, CompanyStatus } from "@prisma/client";
import {
    companyNameValidator,
    companyEmailValidator,
    companyWebsiteValidator,
    companyPhoneNumberValidator,
    companyIdValidator,
    companyLogoValidator,
    companyCoverImageValidator,
    companyDescriptionValidator,
    companyIndustryValidator,
    companySizeValidator,
    foundedYearValidator,
    headquartersValidator,
    companyLinkedInUrlValidator,
    twitterUrlValidator,
    userIdValidator,
    companyInvitationToken
} from "../../../common/validators/validators.js";

export class CompanyDto {
    static createCompany = z.object({
        companyName: companyNameValidator,
        companyEmail: companyEmailValidator.optional(),
        website: companyWebsiteValidator.optional(),
        phoneNumber: companyPhoneNumberValidator.optional(),
        industry: companyIndustryValidator.optional(),
        companySize: companySizeValidator.optional(),
        headquarters: headquartersValidator.optional(),
        description: companyDescriptionValidator.optional(),
        logo: companyLogoValidator.optional(),
        foundedYear: foundedYearValidator.optional(),
        linkedinUrl: companyLinkedInUrlValidator.optional(),
        twitterUrl: twitterUrlValidator.optional(),
    });

    static companyIdParam = z.object({
        companyId: companyIdValidator,
    });

    static updateCompany = z.object({
        companyName: companyNameValidator.optional(),
        companyEmail: companyEmailValidator.optional(),
        website: companyWebsiteValidator.optional(),
        phoneNumber: companyPhoneNumberValidator.optional(),
        logo: companyLogoValidator.optional(),
        coverImage: companyCoverImageValidator.optional(),
        description: companyDescriptionValidator.optional(),
        industry: companyIndustryValidator.optional(),
        companySize: companySizeValidator.optional(),
        foundedYear: foundedYearValidator.optional(),
        headquarters: headquartersValidator.optional(),
        linkedinUrl: companyLinkedInUrlValidator.optional(),
        twitterUrl: twitterUrlValidator.optional(),
        visibility: z.enum(CompanyVisibility).optional(),
        status: z.enum(CompanyStatus).optional()
    }).refine(
        (data) => Object.values(data).some((v) => v !== undefined),
        { message: "At least one field must be provided to update." }
    );

    static deleteCompany = z.object({
        companyId: companyIdValidator,
        userId: userIdValidator
    });

    static sendInvitation = z.object({
        inviterId: userIdValidator,
        inviteeEmail: companyEmailValidator,
        role: z.nativeEnum(CompanyMemberRole).optional().default(CompanyMemberRole.RECRUITER)
    });

    static getCompanyInvitationToken = z.object({
        token: companyInvitationToken
    });

    static acceptOrRejectInvitation = z.object({
        token: companyInvitationToken,
        action: z.string().trim().toLowerCase().refine(action => ["accept", "reject"].includes(action), {
            message: "Action must be 'accept' or 'reject'"
        })
    });

    static updateCompanyMemberRole = z.object({
        role: z.nativeEnum(CompanyMemberRole)
    });

    static removeCompanyMembers = z.object({
        userIds: z
            .array(userIdValidator)
            .min(1, "select atleast one member to remove")
            .max(100, "Maximum of 100 members can be removed at once")
    });

    static searchCompany = z.object({
        keyword: z.string().trim().min(1).max(200).optional(),
        industry: z.string().trim().min(1).max(100).optional(),
        location: z.string().trim().min(1).max(150).optional(),
        companySize: z.string().trim().min(1).max(50).optional(),
        page: z.coerce.number().int().min(1).optional().default(1),
        limit: z.coerce.number().int().min(1).max(100).optional().default(20),
        sortBy: z
            .enum(["companyName", "createdAt", "profileCompletion", "foundedYear"])
            .optional()
            .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    });

    static suspendCompany = z.object({
        reason: z
            .string()
            .trim()
            .min(3, "Reason must be at least 3 characters long")
            .max(500, "Reason must be at most 500 characters long"),
    });

    static cancelInvitationParam = z.object({
        invitationId: userIdValidator,
    });

    static resendInvitationParam = z.object({
        invitationId: userIdValidator,
    });
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