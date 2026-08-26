import type { JobCreationDto, JobUpdateDto } from "../dto/jobs.dto.js";
import { JobStatus, Prisma } from "@prisma/client";
import type { JobMember } from "@prisma/client";
export declare class JobsRepository {
    static createJob(companyId: string, jobCreationPayload: JobCreationDto, slug: string, createdById: string): Promise<any>;
    static listCompanyJobs(companyId: string): Promise<any[]>;
    static listPublishedJobs(params?: {
        search?: string | undefined;
        employmentType?: any;
        workplaceType?: any;
        location?: string | undefined;
    }): Promise<any[]>;
    static getPublicJobById(jobId: string): Promise<any>;
    static findJobById(jobId: string): Promise<any>;
    static updateJobDetails(jobId: string, jobPayload: JobUpdateDto): Promise<any>;
    static updateJobStatus(jobId: string, status: JobStatus): Promise<any>;
    static assignRecruiterToJob(jobId: string, companyMemberId: string): Promise<any>;
    static assignCompanyMemberToJob(jobId: string, companyMemberId: string, assignedBy: string): Promise<JobMember>;
    static findJobAssignment(jobId: string, companyMemberId: string): Promise<JobMember | null>;
    static listAssignedCompanyMembers(jobId: string): Promise<any[]>;
    static removeAssignedCompanyMember(jobId: string, companyMemberId: string): Promise<JobMember>;
    static removeAssignedCompanyMembers(jobId: string, companyMemberIds: string[]): Promise<Prisma.BatchPayload>;
    static saveJob(candidateId: string, jobId: string): Promise<{
        id: string;
        candidateId: string;
        jobId: string;
        savedAt: Date;
    }>;
    static unsaveJob(candidateId: string, jobId: string): Promise<Prisma.BatchPayload>;
    static getSavedJobs(candidateId: string): Promise<({
        job: {
            company: {
                companyName: string;
                logo: string | null;
                industry: string | null;
                headquarters: string | null;
                id: string;
                isVerified: boolean;
            };
            skills: {
                name: string;
                id: string;
                isRequired: boolean;
            }[];
            benefits: {
                id: string;
                benefit: string;
            }[];
        } & {
            companyId: string;
            description: string;
            slug: string;
            employmentType: import("@prisma/client").$Enums.EmploymentType;
            location: string | null;
            id: string;
            status: import("@prisma/client").$Enums.JobStatus;
            createdAt: Date;
            updatedAt: Date;
            visibility: import("@prisma/client").$Enums.JobVisibility;
            title: string;
            createdById: string;
            updatedById: string | null;
            publishedAt: Date | null;
            archivedAt: Date | null;
            summary: string | null;
            workplaceType: import("@prisma/client").$Enums.WorkplaceType;
            vacancies: number;
            minExperience: number;
            maxExperience: number;
            minimumSalary: number | null;
            maximumSalary: number | null;
            salaryPeriod: import("@prisma/client").$Enums.SalaryPeriod | null;
            hideSalary: boolean;
            applicationDeadline: Date | null;
            closedAt: Date | null;
            workflowId: string | null;
        };
    } & {
        id: string;
        candidateId: string;
        jobId: string;
        savedAt: Date;
    })[]>;
    static isJobSaved(candidateId: string, jobId: string): Promise<boolean>;
}
//# sourceMappingURL=jobs.repository.d.ts.map