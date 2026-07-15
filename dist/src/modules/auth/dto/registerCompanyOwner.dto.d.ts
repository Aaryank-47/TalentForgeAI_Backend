import { z } from "zod";
export declare const companyOwnerCompanyDto: z.ZodObject<{
    companyName: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    email: z.ZodEmail;
    phoneNumber: z.ZodString;
    website: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    coverImage: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    companySize: z.ZodOptional<z.ZodString>;
    foundedYear: z.ZodOptional<z.ZodNumber>;
    headquarters: z.ZodOptional<z.ZodString>;
    linkedinUrl: z.ZodOptional<z.ZodString>;
    twitterUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const registerCompanyOwnerDto: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    fullName: z.ZodString;
    company: z.ZodObject<{
        companyName: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        email: z.ZodEmail;
        phoneNumber: z.ZodString;
        website: z.ZodOptional<z.ZodString>;
        logo: z.ZodOptional<z.ZodString>;
        coverImage: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        industry: z.ZodOptional<z.ZodString>;
        companySize: z.ZodOptional<z.ZodString>;
        foundedYear: z.ZodOptional<z.ZodNumber>;
        headquarters: z.ZodOptional<z.ZodString>;
        linkedinUrl: z.ZodOptional<z.ZodString>;
        twitterUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RegisterCompanyOwnerDto = z.infer<typeof registerCompanyOwnerDto>;
export type CompanyOwnerCompanyDto = z.infer<typeof companyOwnerCompanyDto>;
//# sourceMappingURL=registerCompanyOwner.dto.d.ts.map