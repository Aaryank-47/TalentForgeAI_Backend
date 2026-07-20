import type { JobCreationDto, JobDetailsParamDto, JobUpdateDto } from "../dto/jobs.dto.js";
import type { JobView } from "../interfaces/jobs.interface.js";
import { CompanyMemberRole, JobStatus, Prisma } from "@prisma/client";
import type { JobMember } from "@prisma/client";
import type { JobsListView, JobAssignedMemberView } from "../../jobs/interfaces/jobs.interface.js";
export declare class createJobService {
    static createJob(companyId: string, jobPayload: JobCreationDto, userId: string, companyMemberRole: CompanyMemberRole): Promise<JobView>;
    static listCompanyJobs(companyId: string): Promise<JobsListView[]>;
    static getJobDetails(companyId: string, jobId: string): Promise<any>;
    static updateJobDetails(params: JobDetailsParamDto, jobPayload: JobUpdateDto): Promise<JobView>;
    static updateJobStatus(companyId: string, jobId: string, status: JobStatus): Promise<JobView>;
    static assignRecruiterToJob(jobId: string, recruiterId: string, companyId: string): Promise<any>;
    static assignCompanyMemberToJob(companyId: string, jobId: string, companyMemberId: string, assignedBy: string): Promise<JobMember>;
    static listAssignedCompanyMembersForJob(companyId: string, jobId: string): Promise<JobAssignedMemberView[]>;
    static removeAssignedCompanyMembersFromJob(companyId: string, jobId: string, companyMemberIds: string[]): Promise<Prisma.BatchPayload>;
}
//# sourceMappingURL=jobs.services.d.ts.map