import type { JobCreationDto, JobDetailsParamDto, JobUpdateDto } from "../dto/jobs.dto.js";
import type { JobView } from "../interfaces/jobs.interface.js";
import { CompanyMemberRole, JobStatus, Prisma } from "@prisma/client";
import type { JobMember } from "@prisma/client";
import type { JobsListView, JobAssignedMemberView } from "../../jobs/interfaces/jobs.interface.js";
export declare class createJobService {
    static createJob(companyId: string, jobPayload: JobCreationDto, userId: string, companyMemberRole: CompanyMemberRole): Promise<JobView>;
    static listCompanyJobs(companyId: string): Promise<JobsListView[]>;
    static listPublishedJobs(params?: {
        search?: string | undefined;
        employmentType?: any;
        workplaceType?: any;
        location?: string | undefined;
    }): Promise<any[]>;
    static getPublicJobById(jobId: string): Promise<any>;
    static getJobDetails(companyId: string, jobId: string): Promise<any>;
    static updateJobDetails(params: JobDetailsParamDto, jobPayload: JobUpdateDto): Promise<JobView>;
    static updateJobStatus(companyId: string, jobId: string, status: JobStatus): Promise<JobView>;
    static assignRecruiterToJob(jobId: string, recruiterId: string, companyId: string): Promise<any>;
    static assignCompanyMemberToJob(companyId: string, jobId: string, companyMemberId: string, assignedBy: string): Promise<JobMember>;
    static listAssignedCompanyMembersForJob(companyId: string, jobId: string): Promise<JobAssignedMemberView[]>;
    static removeAssignedCompanyMembersFromJob(companyId: string, jobId: string, companyMemberIds: string[]): Promise<Prisma.BatchPayload>;
    static saveJob(userId: string, jobId: string): Promise<{
        id: string;
        candidateId: string;
        jobId: string;
        savedAt: Date;
    }>;
    static unsaveJob(userId: string, jobId: string): Promise<Prisma.BatchPayload>;
    static getSavedJobs(userId: string): Promise<({
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
            requirementsVersion: number;
            workflowId: string | null;
        };
    } & {
        id: string;
        candidateId: string;
        jobId: string;
        savedAt: Date;
    })[]>;
}
//# sourceMappingURL=jobs.services.d.ts.map