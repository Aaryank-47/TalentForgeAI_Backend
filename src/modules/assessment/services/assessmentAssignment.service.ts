import { JobAssessmentRepository } from "../repositories/assessmentAssignment.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { TokenHelper } from "../helper/token.helper.js";
import { emailTemplates } from "../../../common/email/email.templates.js";
import { EmailService } from "../../../common/email/email.service.js";
import { env } from "../../../config/env.js";
import type { AttachAssessmentsToJobDto, ReorderJobAssessmentsDto, CreateAssessmentInvitationDto } from "../dto/assessmentAssignment.dto.js";
import type {
    JobAssessmentAssignmentResponse,
    JobAssessmentListResponse,
    CreateAssessmentInvitationResponse,
    GetAssessmentInvitationResponse
} from "../interfaces/assessmentAssignment.interface.js";
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

    static async createAssessmentInvitation(
        applicationId: string,
        dto: CreateAssessmentInvitationDto
    ): Promise<CreateAssessmentInvitationResponse> {
        const application = await JobAssessmentRepository.findApplicationForInvitation(applicationId);

        if (!application) {
            throw new NotFoundError("Application not found.");
        }

        const assessmentId = dto.assessmentId;
        const assessment = await JobAssessmentRepository.findAssessmentForInvitation(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found.");
        }
        if (assessment.status !== "PUBLISHED") {
            throw new ConflictError("Assessment is not published.");
        }

        if (assessment.companyId !== application.job.companyId) {
            throw new ConflictError("This assessment does not belong to the same company as the application.");
        }

        const currentStageAssessmentId = application.applicationWorkflow?.workflowStage?.assessmentId;
        if (!currentStageAssessmentId || currentStageAssessmentId !== assessmentId) {
            throw new ConflictError("This assessment is not assigned to the current workflow stage of this application.");
        }

        const existingInvite = await JobAssessmentRepository.findInvitationByApplicationAndAssessment(
            applicationId,
            assessmentId
        );
        if (existingInvite) {
            throw new ConflictError("An invitation has already been created for this assessment and application.");
        }

        const token = TokenHelper.generateSecureToken();

        const expiresAtDate = new Date(dto.expiresAt);
        const invitation = await JobAssessmentRepository.createAssessmentInvitation({
            applicationId,
            assessmentId,
            token,
            expiresAt: expiresAtDate
        });

        if (dto.sendEmail && application.candidate.user.email) {
            const inviteLink = `${env.app.frontendUrl}/assessments/take?token=${token}`;
            const template = emailTemplates.assessmentInvitationTemplate(
                application.candidate.fullName,
                assessment.title,
                expiresAtDate.toUTCString(),
                inviteLink
            );
            const emailTemplate = {
                to: application.candidate.user.email,
                ...template
            };
            await EmailService.sendEmail(emailTemplate).catch(err => {
                console.error("Failed to send invitation email:", err);
            });
        }

        return {
            invitationId: invitation.id,
            assessmentId: invitation.assessmentId,
            token: invitation.token,
            expiresAt: invitation.expiresAt
        };
    }

    static async getAssessmentInvitation(
        applicationId: string
    ): Promise<GetAssessmentInvitationResponse> {
        const invitation = await JobAssessmentRepository.findInvitationWithAttempt(applicationId);
        if (!invitation) {
            throw new NotFoundError("No assessment invitation found for this application.");
        }

        const latestAttempt = invitation.application.assessmentAttempts[0];
        let status = "PENDING";

        if (latestAttempt) {
            if (latestAttempt.status === "SUBMITTED") {
                status = "SUBMITTED";
            } else if (latestAttempt.status === "IN_PROGRESS") {
                status = "STARTED";
            } else if (latestAttempt.status === "EXPIRED") {
                status = "EXPIRED";
            }
        } else {
            if (new Date(invitation.expiresAt) < new Date()) {
                status = "EXPIRED";
            }
        }

        return {
            id: invitation.id,
            status,
            assessmentTitle: invitation.assessment.title,
            expiresAt: invitation.expiresAt
        };
    }
}
