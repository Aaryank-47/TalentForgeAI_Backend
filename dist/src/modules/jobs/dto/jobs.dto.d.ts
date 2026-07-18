import { z } from "zod";
export declare const jobCreationDto: z.ZodObject<{
    companyId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    employmentType: z.ZodEnum<{
        INTERN: "INTERN";
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
        CONTRACT: "CONTRACT";
        FREELANCE: "FREELANCE";
        TEMPORARY: "TEMPORARY";
        APPRENTICESHIP: "APPRENTICESHIP";
    }>;
    workplaceType: z.ZodEnum<{
        REMOTE: "REMOTE";
        HYBRID: "HYBRID";
        ONSITE: "ONSITE";
    }>;
    vacancies: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    location: z.ZodOptional<z.ZodString>;
    minExperience: z.ZodOptional<z.ZodNumber>;
    maxExperience: z.ZodOptional<z.ZodNumber>;
    minimumSalary: z.ZodOptional<z.ZodNumber>;
    maximumSalary: z.ZodOptional<z.ZodNumber>;
    salaryPeriod: z.ZodOptional<z.ZodEnum<{
        HOURLY: "HOURLY";
        MONTHLY: "MONTHLY";
        YEARLY: "YEARLY";
    }>>;
    hideSalary: z.ZodOptional<z.ZodBoolean>;
    applicationDeadline: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    skills: z.ZodArray<z.ZodString>;
    benefits: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type JobCreationDto = z.infer<typeof jobCreationDto>;
//# sourceMappingURL=jobs.dto.d.ts.map