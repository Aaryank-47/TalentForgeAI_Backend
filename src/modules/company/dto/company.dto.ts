import { z } from "zod";
import { CompanyMemberRole } from "@prisma/client";
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
}).refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "At least one field must be provided to update." }
);

export type UpdateCompanyDto = z.infer<typeof updateCompanyDto>;

export const deleteCompanyDto = z.object({
    companyId: companyIdValidator,
    userId:userIdValidator
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
    action: z.string().trim().toLowerCase().refine(action => ["accept","reject"].includes(action), {
        message: "Action must be 'accept' or 'reject'"
    })
})

export type AcceptOrRejectInvitationDto = z.infer<typeof acceptOrRejectInvitationDto>;

export const updateCompanyMemberRoleDto = z.object({
    role: z.nativeEnum(CompanyMemberRole)
})

export type UpdateCompanyMemberRoleDto = z.infer<typeof updateCompanyMemberRoleDto>