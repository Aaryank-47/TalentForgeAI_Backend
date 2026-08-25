import { z } from "zod";
export declare class RegisterCompanyOwnerDto {
    static companyOwnerCompany: z.ZodObject<{
        companyName: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        email: z.ZodEmail;
        phoneNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>;
        website: z.ZodOptional<z.ZodString>;
        logo: z.ZodOptional<z.ZodString>;
        coverImage: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        industry: z.ZodOptional<z.ZodString>;
        companySize: z.ZodOptional<z.ZodString>;
        foundedYear: z.ZodOptional<z.ZodNumber>;
        headquarters: z.ZodOptional<z.ZodString>;
        linkedinUrl: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>;
        twitterUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static registerCompanyOwner: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
        fullName: z.ZodString;
        company: z.ZodObject<{
            companyName: z.ZodString;
            slug: z.ZodOptional<z.ZodString>;
            email: z.ZodEmail;
            phoneNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>;
            website: z.ZodOptional<z.ZodString>;
            logo: z.ZodOptional<z.ZodString>;
            coverImage: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            industry: z.ZodOptional<z.ZodString>;
            companySize: z.ZodOptional<z.ZodString>;
            foundedYear: z.ZodOptional<z.ZodNumber>;
            headquarters: z.ZodOptional<z.ZodString>;
            linkedinUrl: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>;
            twitterUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}
export type RegisterCompanyOwnerDtoType = z.infer<typeof RegisterCompanyOwnerDto.registerCompanyOwner>;
export type CompanyOwnerCompanyDto = z.infer<typeof RegisterCompanyOwnerDto.companyOwnerCompany>;
//# sourceMappingURL=registerCompanyOwner.dto.d.ts.map