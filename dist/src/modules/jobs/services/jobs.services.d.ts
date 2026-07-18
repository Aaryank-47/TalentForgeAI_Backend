import type { JobCreationDto } from "../dto/jobs.dto.js";
import type { JobView } from "../interfaces/jobs.interface.js";
import { CompanyMemberRole } from "@prisma/client";
import type { JobsListView } from "../../jobs/interfaces/jobs.interface.js";
export declare class createJobService {
    static createJob(companyId: string, jobPayload: JobCreationDto, userId: string, companyMemberRole: CompanyMemberRole): Promise<JobView>;
    static listCompanyJobs(companyId: string): Promise<JobsListView[]>;
    static getJobDetails(companyId: string, jobId: string): Promise<any>;
}
//# sourceMappingURL=jobs.services.d.ts.map