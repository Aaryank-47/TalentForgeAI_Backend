import { z } from "zod";
import { emailValidator, companyNameValidator, passwordValidator, companyPhoneNumberValidator, companyWebsiteValidator, companyLogoValidator, companyCoverImageValidator, companyDescriptionValidator, companyIndustryValidator, companySizeValidator, foundedYearValidator, headquartersValidator, companyLinkedInUrlValidator, twitterUrlValidator, employerFullNameValidator } from "../../../common/validators/validators.js";
export const companyOwnerCompanyDto = z.object({
    companyName: companyNameValidator,
    slug: z.string().trim().min(1).max(180).optional(),
    email: emailValidator,
    phoneNumber: companyPhoneNumberValidator,
    website: companyWebsiteValidator,
    logo: companyLogoValidator,
    coverImage: companyCoverImageValidator,
    description: companyDescriptionValidator,
    industry: companyIndustryValidator,
    companySize: companySizeValidator,
    foundedYear: foundedYearValidator,
    headquarters: headquartersValidator,
    linkedinUrl: companyLinkedInUrlValidator,
    twitterUrl: twitterUrlValidator,
});
export const registerCompanyOwnerDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    fullName: employerFullNameValidator,
    company: companyOwnerCompanyDto,
});
//# sourceMappingURL=registerCompanyOwner.dto.js.map