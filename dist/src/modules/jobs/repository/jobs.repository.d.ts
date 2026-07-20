import type { JobCreationDto, JobUpdateDto } from "../dto/jobs.dto.js";
import { JobStatus, Prisma } from "@prisma/client";
import type { JobMember } from "@prisma/client";
export declare class JobsRepository {
    static createJob(companyId: string, jobCreationPayload: JobCreationDto, slug: string, createdById: string): Promise<any>;
    static listCompanyJobs(companyId: string): Promise<any[]>;
    static findJobById(jobId: string): Promise<any>;
    static updateJobDetails(jobId: string, jobPayload: JobUpdateDto): Promise<any>;
    static updateJobStatus(jobId: string, status: JobStatus): Promise<any>;
    static assignRecruiterToJob(jobId: string, companyMemberId: string): Promise<any>;
    static assignCompanyMemberToJob(jobId: string, companyMemberId: string, assignedBy: string): Promise<JobMember>;
    static findJobAssignment(jobId: string, companyMemberId: string): Promise<JobMember | null>;
    static listAssignedCompanyMembers(jobId: string): Promise<any[]>;
    static removeAssignedCompanyMember(jobId: string, companyMemberId: string): Promise<JobMember>;
    static removeAssignedCompanyMembers(jobId: string, companyMemberIds: string[]): Promise<Prisma.BatchPayload>;
}
//# sourceMappingURL=jobs.repository.d.ts.map