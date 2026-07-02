import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";
const optionalText = z.string().trim().min(1).max(255).optional();
const optionalUrl = z.string().trim().url("Please enter a valid URL").optional();
export const recruiterCompanyDto = z.object({
    name: z.string().trim().min(1, "Company name is required").max(150),
    slug: z.string().trim().min(1).max(180).optional(),
    email: emailValidator.optional(),
    phone: optionalText,
    website: optionalUrl,
    logo: optionalUrl,
    coverImage: optionalUrl,
    description: z.string().trim().min(1).max(2000).optional(),
    industry: optionalText,
    companySize: optionalText,
    foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
    headquarters: optionalText,
    linkedinUrl: optionalUrl,
    twitterUrl: optionalUrl,
});
export const registerRecruiterDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    phone: optionalText,
    designation: optionalText,
    department: optionalText,
    profilePicture: optionalUrl,
    linkedinUrl: optionalUrl,
    isPrimaryRecruiter: z.boolean().optional(),
    canCreateJobs: z.boolean().optional(),
    canEditJobs: z.boolean().optional(),
    canDeleteJobs: z.boolean().optional(),
    canScheduleInterview: z.boolean().optional(),
    companyId: z.string().trim().min(1).optional(),
    company: recruiterCompanyDto.optional(),
}).refine((data) => Boolean(data.companyId || data.company), {
    message: "Provide either companyId or company details.",
    path: ["company"],
});
//# sourceMappingURL=registerRecruiter.dto.js.map