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

export const createCompanyDto = z.object({
    companyName: companyNameValidator,
    companyEmail: companyEmailValidator.optional(),
    website: companyWebsiteValidator.optional(),
    phoneNumber: companyPhoneNumberValidator.optional(),
});

export type CreateCompanyDto = z.infer<typeof createCompanyDto>;

export const companyIdParamDto = z.object({
    companyId: companyIdValidator,
});

export type CompanyIdParamDto = z.infer<typeof companyIdParamDto>;

export const updateCompanyDto = z.object({
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
    visibility:z.enum(CompanyVisibility).optional(),
    status: z.enum(CompanyStatus).optional()

}).refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "At least one field must be provided to update." }
);

export type UpdateCompanyDto = z.infer<typeof updateCompanyDto>;

export const deleteCompanyDto = z.object({
    companyId: companyIdValidator,
    userId: userIdValidator
})

export type DeleteCompanyDto = z.infer<typeof deleteCompanyDto>;

export const sendInvitationDto = z.object({
    inviterId: userIdValidator,
    inviteeEmail: companyEmailValidator,
    role: z.nativeEnum(CompanyMemberRole).optional().default(CompanyMemberRole.RECRUITER)
})

export type SendInvitationDto = z.infer<typeof sendInvitationDto>;

export const getCompanyInvitationTokenDto = z.object({
    token: companyInvitationToken
})

export type GetCompanyInvitationTokenDto = z.infer<typeof getCompanyInvitationTokenDto>;

export const acceptOrRejectInvitationDto = z.object({
    token: companyInvitationToken,
    action: z.string().trim().toLowerCase().refine(action => ["accept", "reject"].includes(action), {
        message: "Action must be 'accept' or 'reject'"
    })
})

export type AcceptOrRejectInvitationDto = z.infer<typeof acceptOrRejectInvitationDto>;

export const updateCompanyMemberRoleDto = z.object({
    role: z.nativeEnum(CompanyMemberRole)
})

export type UpdateCompanyMemberRoleDto = z.infer<typeof updateCompanyMemberRoleDto>

export const removeCompanyMembersDto = z.object({
    userIds: z
        .array(userIdValidator)
        .min(1, "select atleast one member to remove")
        .max(100, "Maximum of 100 members can be removed at once")
});

export type RemoveCompanyMembersDto = z.infer<typeof removeCompanyMembersDto>;

export const searchCompanyDto = z.object({
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

export type SearchCompanyDto = z.infer<typeof searchCompanyDto>;

export const suspendCompanyDto = z.object({
    reason: z
        .string()
        .trim()
        .min(3, "Reason must be at least 3 characters long")
        .max(500, "Reason must be at most 500 characters long"),
});

export type SuspendCompanyDto = z.infer<typeof suspendCompanyDto>;

export const cancelInvitationParamDto = z.object({
    invitationId: userIdValidator,
});

export type CancelInvitationParamDto = z.infer<typeof cancelInvitationParamDto>;

export const resendInvitationParamDto = z.object({
    invitationId: userIdValidator,
});

export type ResendInvitationParamDto = z.infer<typeof resendInvitationParamDto>;