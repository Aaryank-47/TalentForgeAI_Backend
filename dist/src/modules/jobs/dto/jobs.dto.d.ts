import { z } from "zod";
export declare class JobsDto {
    static createJob: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        employmentType: z.ZodEnum<{
            FULL_TIME: "FULL_TIME";
            PART_TIME: "PART_TIME";
            CONTRACT: "CONTRACT";
            INTERN: "INTERN";
            FREELANCE: "FREELANCE";
            TEMPORARY: "TEMPORARY";
            APPRENTICESHIP: "APPRENTICESHIP";
        }>;
        workplaceType: z.ZodEnum<{
            ONSITE: "ONSITE";
            REMOTE: "REMOTE";
            HYBRID: "HYBRID";
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
        workflowId: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<{
            DRAFT: "DRAFT";
            PUBLISHED: "PUBLISHED";
            PAUSED: "PAUSED";
            CLOSED: "CLOSED";
            FILLED: "FILLED";
            EXPIRED: "EXPIRED";
            ARCHIVED: "ARCHIVED";
        }>>;
    }, z.core.$strip>;
    static updateJob: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        employmentType: z.ZodOptional<z.ZodEnum<{
            FULL_TIME: "FULL_TIME";
            PART_TIME: "PART_TIME";
            CONTRACT: "CONTRACT";
            INTERN: "INTERN";
            FREELANCE: "FREELANCE";
            TEMPORARY: "TEMPORARY";
            APPRENTICESHIP: "APPRENTICESHIP";
        }>>;
        workplaceType: z.ZodOptional<z.ZodEnum<{
            ONSITE: "ONSITE";
            REMOTE: "REMOTE";
            HYBRID: "HYBRID";
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
        workflowId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static jobDetailsParam: z.ZodObject<{
        companyId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strip>;
    static statusUpdate: z.ZodObject<{
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
    static assignRecruiterToJob: z.ZodObject<{
        jobId: z.ZodString;
        recruiterId: z.ZodString;
    }, z.core.$strip>;
    static assignCompanyMemberToJob: z.ZodObject<{
        companyMemberId: z.ZodString;
    }, z.core.$strip>;
    static jobAssignmentMemberParams: z.ZodObject<{
        companyId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strip>;
    static listAssignedMembersParams: z.ZodObject<{
        companyId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strip>;
    static removeAssignedCompanyMembers: z.ZodObject<{
        companyMemberIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    static saveJobParam: z.ZodObject<{
        jobId: z.ZodString;
    }, z.core.$strip>;
}
export type JobCreationDto = z.infer<typeof JobsDto.createJob>;
export type JobUpdateDto = z.infer<typeof JobsDto.updateJob>;
export type JobDetailsParamDto = z.infer<typeof JobsDto.jobDetailsParam>;
export type StatusUpdateDto = z.infer<typeof JobsDto.statusUpdate>;
export type AssignRecruiterToJobDto = z.infer<typeof JobsDto.assignRecruiterToJob>;
export type AssignCompanyMemberToJobDto = z.infer<typeof JobsDto.assignCompanyMemberToJob>;
export type JobAssignmentMemberParamsDto = z.infer<typeof JobsDto.jobAssignmentMemberParams>;
export type ListAssignedMembersParamsDto = z.infer<typeof JobsDto.listAssignedMembersParams>;
export type RemoveAssignedCompanyMembersDto = z.infer<typeof JobsDto.removeAssignedCompanyMembers>;
//# sourceMappingURL=jobs.dto.d.ts.map