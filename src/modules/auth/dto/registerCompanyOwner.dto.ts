import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";

const requiredText = z.string().trim().min(1).max(255);
const requiredUrl = z.string().trim().url("Please enter a valid URL");

export const companyOwnerCompanyDto = z.object({
    name: z.string().trim().min(1, "Company name is required").max(150),
    slug: z.string().trim().min(1).max(180).optional(),
    email: emailValidator,
    phone: requiredText,
    website: requiredUrl,
    logo: requiredUrl,
    coverImage: requiredUrl,
    description: z.string().trim().min(1, "Company description is required").max(2000),
    industry: requiredText,
    companySize: requiredText,
    foundedYear: z.number().int().min(1800).max(new Date().getFullYear()),
    headquarters: requiredText,
    linkedinUrl: requiredUrl,
    twitterUrl: requiredUrl,
});

export const registerCompanyOwnerDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    fullName: z.string().trim().min(1, "Full name is required").max(150),
    company: companyOwnerCompanyDto,
});

export type RegisterCompanyOwnerDto = z.infer<typeof registerCompanyOwnerDto>;
export type CompanyOwnerCompanyDto = z.infer<typeof companyOwnerCompanyDto>;
