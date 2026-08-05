import { JobAssessmentRepository } from "../repositories/jobAssessment.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
export class JobAssessmentService {
    static async attachAssessmentsToJob(jobId, dto, user) {
        // Find Job
        const job = await JobAssessmentRepository.findJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }
        // Attach Assessments in Transaction (verifying ownership of each assessment inside it)
        const assignedCount = await JobAssessmentRepository.attachAssessmentsToJob(jobId, job.companyId, dto.assessments);
        return {
            jobId,
            assignedCount
        };
    }
}
//# sourceMappingURL=jobAssessment.service.js.map