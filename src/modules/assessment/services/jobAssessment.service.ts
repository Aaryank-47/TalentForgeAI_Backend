import { JobAssessmentRepository } from "../repositories/jobAssessment.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import type { AttachAssessmentsToJobDto, ReorderJobAssessmentsDto } from "../dto/jobAssessment.dto.js";
import type {
    JobAssessmentAssignmentResponse,
    JobAssessmentListResponse
} from "../interfaces/jobAssessment.interface.js";
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

    static async getJobAssessments(jobId: string): Promise<JobAssessmentListResponse> {
        const job = await JobAssessmentRepository.findJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        const list = await JobAssessmentRepository.findJobAssessmentsByJobId(jobId);

        return list.map((item) => {
            const assessment = (item as any).assessment;
            return {
                id: `${item.jobId}_${item.assessmentId}`,
                assessment: {
                    id: assessment?.id || item.assessmentId,
                    title: assessment?.title || "",
                    status: assessment?.status || "DRAFT",
                    durationMinutes: assessment?.durationMinutes || null
                }
            };
        });
    }

    static async updateJobAssessment(
        jobId: string,
        dto: AttachAssessmentsToJobDto,
        user: AuthTokenPayload
    ): Promise<JobAssessmentAssignmentResponse> {
        const job = await JobAssessmentRepository.findJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        const assignedCount = await JobAssessmentRepository.syncJobAssessments(jobId, job.companyId, dto.assessments);

        return {
            jobId,
            assignedCount
        };
    }

    static async removeJobAssessment(jobAssessmentId: string): Promise<void> {
        const [jobId, assessmentId] = jobAssessmentId.split("_");
        if (!jobId || !assessmentId) {
            throw new BadRequestError("Invalid job assessment ID format");
        }

        const job = await JobAssessmentRepository.findJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        const existing = await JobAssessmentRepository.findJobAssessment(jobId, assessmentId);
        if (!existing) {
            throw new NotFoundError("Job assessment relation not found");
        }

        await JobAssessmentRepository.removeJobAssessment(jobId, assessmentId);
    }

    static async reorderJobAssessments(dto: ReorderJobAssessmentsDto): Promise<void> {
        const job = await JobAssessmentRepository.findJobById(dto.jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        await JobAssessmentRepository.reorderJobAssessments(dto.jobId, dto.assessments);
    }
}
