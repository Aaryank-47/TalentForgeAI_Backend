import { z } from "zod";
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