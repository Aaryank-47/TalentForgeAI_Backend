import type { JobCreationDto } from "../dto/jobs.dto.js";
export declare class JobsRepository {
    static createJob(companyId: string, data: JobCreationDto, slug: string, createdById: string): Promise<any>;
    static listCompanyJobs(companyId: string): Promise<any[]>;
    static findJobById(jobId: string): Promise<any>;
}
//# sourceMappingURL=jobs.repository.d.ts.map