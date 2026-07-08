import { z } from "zod";
export declare const companyOwnerCompanyDto: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    email: z.ZodEmail;
    phone: z.ZodString;
    website: z.ZodString;
    logo: z.ZodString;
    coverImage: z.ZodString;
    description: z.ZodString;
    industry: z.ZodString;
    companySize: z.ZodString;
    foundedYear: z.ZodNumber;
    headquarters: z.ZodString;
    linkedinUrl: z.ZodString;
    twitterUrl: z.ZodString;
}, z.core.$strip>;
export declare const registerCompanyOwnerDto: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    fullName: z.ZodString;
    company: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        email: z.ZodEmail;
        phone: z.ZodString;
        website: z.ZodString;
        logo: z.ZodString;
        coverImage: z.ZodString;
        description: z.ZodString;
        industry: z.ZodString;
        companySize: z.ZodString;
        foundedYear: z.ZodNumber;
        headquarters: z.ZodString;
        linkedinUrl: z.ZodString;
        twitterUrl: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RegisterCompanyOwnerDto = z.infer<typeof registerCompanyOwnerDto>;
export type CompanyOwnerCompanyDto = z.infer<typeof companyOwnerCompanyDto>;
//# sourceMappingURL=registerCompanyOwner.dto.d.ts.map