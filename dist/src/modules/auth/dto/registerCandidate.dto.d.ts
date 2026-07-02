import { z } from "zod";
export declare const registerCandidateDto: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    profilePicture: z.ZodOptional<z.ZodString>;
    headline: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        MALE: "MALE";
        FEMALE: "FEMALE";
        OTHER: "OTHER";
        PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY";
    }>>;
    experienceLevel: z.ZodOptional<z.ZodEnum<{
        FRESHER: "FRESHER";
        INTERN: "INTERN";
        JUNIOR: "JUNIOR";
        MID_LEVEL: "MID_LEVEL";
        SENIOR: "SENIOR";
        LEAD: "LEAD";
        ARCHITECT: "ARCHITECT";
    }>>;
    currentLocation: z.ZodOptional<z.ZodString>;
    preferredLocation: z.ZodOptional<z.ZodString>;
    currentCompany: z.ZodOptional<z.ZodString>;
    currentDesignation: z.ZodOptional<z.ZodString>;
    totalExperience: z.ZodOptional<z.ZodNumber>;
    expectedSalary: z.ZodOptional<z.ZodNumber>;
    currentSalary: z.ZodOptional<z.ZodNumber>;
    noticePeriod: z.ZodOptional<z.ZodNumber>;
    linkedinUrl: z.ZodOptional<z.ZodString>;
    githubUrl: z.ZodOptional<z.ZodString>;
    portfolioUrl: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    isOpenToWork: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type RegisterCandidateDto = z.infer<typeof registerCandidateDto>;
//# sourceMappingURL=registerCandidate.dto.d.ts.map