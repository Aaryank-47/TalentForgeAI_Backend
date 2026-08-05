import { JobAssessmentRepository } from "../repositories/jobAssessment.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import type { AttachAssessmentsToJobDto } from "../dto/jobAssessment.dto.js";
import type { JobAssessmentAssignmentResponse } from "../interfaces/jobAssessment.interface.js";
import type { AuthTokenPayload } from "../../auth/interfaces/auth.interface.js";

export class JobAssessmentService {
    static async attachAssessmentsToJob(
        jobId: string,
        dto: AttachAssessmentsToJobDto,
        user: AuthTokenPayload
    ): Promise<JobAssessmentAssignmentResponse> {
        const job = await JobAssessmentRepository.findJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        const assignedCount = await JobAssessmentRepository.attachAssessmentsToJob(jobId, job.companyId, dto.assessments);

        return {
            jobId,
            assignedCount
        };
    }
}
