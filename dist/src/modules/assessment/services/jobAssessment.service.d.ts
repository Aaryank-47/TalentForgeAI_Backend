import type { AttachAssessmentsToJobDto } from "../dto/jobAssessment.dto.js";
import type { JobAssessmentAssignmentResponse } from "../interfaces/jobAssessment.interface.js";
import type { AuthTokenPayload } from "../../auth/interfaces/auth.interface.js";
export declare class JobAssessmentService {
    static attachAssessmentsToJob(jobId: string, dto: AttachAssessmentsToJobDto, user: AuthTokenPayload): Promise<JobAssessmentAssignmentResponse>;
}
//# sourceMappingURL=jobAssessment.service.d.ts.map