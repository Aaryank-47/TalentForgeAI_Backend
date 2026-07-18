import type { JobCreationDto } from "../dto/jobs.dto.js";
import type { JobView } from "../interfaces/jobs.interface.js";
export declare class createJobService {
    static createJob(jobPayload: JobCreationDto, userId: string): Promise<JobView>;
}
//# sourceMappingURL=jobs.services.d.ts.map