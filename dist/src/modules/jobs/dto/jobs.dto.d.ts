import { z } from "zod";
export declare const jobCreationDto: z.ZodObject<{
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
    vacancies: z.ZodOptional<z.ZodNumber>;
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
export declare const jobUpdateDto: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodEnum<{
        INTERN: "INTERN";
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
        CONTRACT: "CONTRACT";
        FREELANCE: "FREELANCE";
        TEMPORARY: "TEMPORARY";
        APPRENTICESHIP: "APPRENTICESHIP";
    }>>;
    workplaceType: z.ZodOptional<z.ZodEnum<{
        REMOTE: "REMOTE";
        HYBRID: "HYBRID";
        ONSITE: "ONSITE";
    }>>;
    vacancies: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    minExperience: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    maxExperience: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    minimumSalary: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    maximumSalary: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    salaryPeriod: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        HOURLY: "HOURLY";
        MONTHLY: "MONTHLY";
        YEARLY: "YEARLY";
    }>>>;
    hideSalary: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    applicationDeadline: z.ZodOptional<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString>>;
    benefits: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export type JobUpdateDto = z.infer<typeof jobUpdateDto>;
export declare const jobDetailsParamDto: z.ZodObject<{
    companyId: z.ZodString;
    jobId: z.ZodString;
}, z.core.$strip>;
export type JobDetailsParamDto = z.infer<typeof jobDetailsParamDto>;
export declare const statusUpdateDto: z.ZodObject<{
    status: z.ZodEnum<{
        DRAFT: "DRAFT";
        PUBLISHED: "PUBLISHED";
        PAUSED: "PAUSED";
        CLOSED: "CLOSED";
        FILLED: "FILLED";
        EXPIRED: "EXPIRED";
        ARCHIVED: "ARCHIVED";
    }>;
}, z.core.$strip>;
export type StatusUpdateDto = z.infer<typeof statusUpdateDto>;
export declare const assignRecruiterToJobDto: z.ZodObject<{
    jobId: z.ZodString;
    recruiterId: z.ZodString;
}, z.core.$strip>;
export type AssignRecruiterToJobDto = z.infer<typeof assignRecruiterToJobDto>;
export declare const assignCompanyMemberToJobDto: z.ZodObject<{
    companyMemberId: z.ZodString;
}, z.core.$strip>;
export type AssignCompanyMemberToJobDto = z.infer<typeof assignCompanyMemberToJobDto>;
export declare const jobAssignmentMemberParamsDto: z.ZodObject<{
    companyId: z.ZodString;
    jobId: z.ZodString;
}, z.core.$strip>;
export type JobAssignmentMemberParamsDto = z.infer<typeof jobAssignmentMemberParamsDto>;
export declare const listAssignedMembersParamsDto: z.ZodObject<{
    companyId: z.ZodString;
    jobId: z.ZodString;
}, z.core.$strip>;
export type ListAssignedMembersParamsDto = z.infer<typeof listAssignedMembersParamsDto>;
export declare const removeAssignedCompanyMembersDto: z.ZodObject<{
    companyMemberIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type RemoveAssignedCompanyMembersDto = z.infer<typeof removeAssignedCompanyMembersDto>;
//# sourceMappingURL=jobs.dto.d.ts.map