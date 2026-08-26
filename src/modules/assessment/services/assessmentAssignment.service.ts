import { JobAssessmentRepository } from "../repositories/assessmentAssignment.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { TokenHelper } from "../helper/token.helper.js";
import { emailTemplates } from "../../../common/email/email.templates.js";
import { EmailService } from "../../../common/email/email.service.js";
import { env } from "../../../config/env.js";
import { InvitationStatus } from "@prisma/client";
import type { AttachAssessmentsToJobDto, ReorderJobAssessmentsDto, CreateAssessmentInvitationDto } from "../dto/assessmentAssignment.dto.js";
import type {
    JobAssessmentAssignmentResponse,
    JobAssessmentListResponse,
    CreateAssessmentInvitationResponse,
    GetAssessmentInvitationResponse,
    AssessmentInvitationPreviewResponse
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

        if (dto.assessments.length > 0) {
            await JobAssessmentRepository.validateJobWorkflowSupportsAssessments(job.id);
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
                displayOrder: item.displayOrder,
                isMandatory: item.isMandatory,
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

        if (dto.assessments.length > 0) {
            await JobAssessmentRepository.validateJobWorkflowSupportsAssessments(job.id);
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
        dto: CreateAssessmentInvitationDto,
        idempotencyKey?: string
    ): Promise<CreateAssessmentInvitationResponse> {
        if (idempotencyKey) {
            const existingInvitation = await JobAssessmentRepository.findInvitationByIdempotencyKey(idempotencyKey);
            if (existingInvitation) {
                if (existingInvitation.applicationId === applicationId && existingInvitation.assessmentId === dto.assessmentId) {
                    return {
                        invitationId: existingInvitation.id,
                        assessmentId: existingInvitation.assessmentId,
                        token: existingInvitation.token,
                        expiresAt: existingInvitation.expiresAt
                    };
                } else {
                    throw new ConflictError("Idempotency key already used with different request.");
                }
            }
        }

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
        const jobAssessmentMatch = application.job?.jobAssessments?.some(ja => ja.assessmentId === assessmentId);

        if (!currentStageAssessmentId && !jobAssessmentMatch) {
            throw new ConflictError("This assessment is not assigned to this job or the current workflow stage.");
        }
        if (currentStageAssessmentId && currentStageAssessmentId !== assessmentId && !jobAssessmentMatch) {
            throw new ConflictError("This assessment is not assigned to the current workflow stage of this application.");
        }

        const activeInvite = application.assessmentInvitations.find(
            (inv) => inv.assessmentId === assessmentId && inv.status === InvitationStatus.PENDING
        );
        if (activeInvite) {
            throw new ConflictError("An active assessment invitation already exists.");
        }

        const completedInvite = application.assessmentInvitations.find(
            (inv) => inv.assessmentId === assessmentId && inv.status === InvitationStatus.SUBMITTED
        );
        if (completedInvite) {
            throw new ConflictError("Retakes are disabled and this assessment has already been completed.");
        }

        const token = TokenHelper.generateSecureToken();

        const expiresAtDate = new Date(dto.expiresAt);
        const invitation = await JobAssessmentRepository.createAssessmentInvitation({
            applicationId,
            assessmentId,
            token,
            status: InvitationStatus.PENDING,
            idempotencyKey: idempotencyKey || null,
            expiresAt: expiresAtDate
        });

        if (dto.sendEmail && application.candidate.user.email) {
            const inviteLink = `${env.app.frontendUrl}/candidate/assessments/${assessment.id}/preparation?token=${token}&applicationId=${applicationId}`;
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
    ) {
        const invitation = await JobAssessmentRepository.findInvitationWithAttempt(applicationId);
        if (!invitation) {
            throw new NotFoundError("No assessment invitation found for this application.");
        }

        const latestAttempt = invitation.application.assessmentAttempts[0];
        let status = invitation.status as string;

        if (latestAttempt) {
            if (latestAttempt.status === "SUBMITTED") {
                status = "COMPLETED";
            } else if (latestAttempt.status === "IN_PROGRESS") {
                status = "IN_PROGRESS";
            } else if (latestAttempt.status === "EXPIRED") {
                status = "EXPIRED";
            }
        } else {
            if (new Date(invitation.expiresAt) < new Date() && status === "PENDING") {
                status = "EXPIRED";
            }
        }

        return {
            id: invitation.id,
            token: invitation.token,
            applicationId: invitation.applicationId,
            status,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt,
            assessment: {
                id: invitation.assessment.id,
                title: invitation.assessment.title,
                description: invitation.assessment.description,
                instructions: invitation.assessment.instructions,
                durationMinutes: invitation.assessment.durationMinutes,
                passingScore: invitation.assessment.passingScore,
                totalMarks: invitation.assessment.totalMarks,
                company: invitation.assessment.company || invitation.application?.job?.company || null,
            },
            job: invitation.application?.job || null,
            attempt: latestAttempt ? {
                id: latestAttempt.id,
                status: latestAttempt.status,
                overallScore: latestAttempt.overallScore,
                percentage: latestAttempt.percentage,
                startedAt: latestAttempt.startedAt,
                submittedAt: latestAttempt.submittedAt,
            } : null
        };
    }

    static async validateInvitation(token: string): Promise<AssessmentInvitationPreviewResponse> {
        const invitation = await JobAssessmentRepository.findInvitationByToken(token);
        if (!invitation) {
            throw new NotFoundError("Invitation token not found.");
        }

        if (invitation.status === InvitationStatus.CANCELLED) {
            throw new ConflictError("Invitation has been cancelled.");
        }

        if (invitation.status === InvitationStatus.EXPIRED || new Date(invitation.expiresAt) < new Date()) {
            if (invitation.status === InvitationStatus.PENDING) {
                await JobAssessmentRepository.updateInvitationStatus(invitation.id, InvitationStatus.EXPIRED);
            }
            throw new ConflictError("Invitation has expired.");
        }

        const latestAttempt = invitation.application.assessmentAttempts[0];
        if (latestAttempt && latestAttempt.status === "SUBMITTED") {
            if (invitation.status !== InvitationStatus.SUBMITTED) {
                await JobAssessmentRepository.updateInvitationStatus(invitation.id, InvitationStatus.SUBMITTED);
            }
            throw new ConflictError("Assessment has already been submitted.");
        }

        return {
            candidateName: invitation.application.candidate.fullName,
            assessmentTitle: invitation.assessment.title,
            duration: invitation.assessment.durationMinutes,
            expiresAt: invitation.expiresAt
        };
    }

    static async resendInvitation(id: string): Promise<void> {
        const invitation = await JobAssessmentRepository.findInvitationById(id);
        if (!invitation) {
            throw new NotFoundError("Invitation not found.");
        }

        if (invitation.status === InvitationStatus.CANCELLED) {
            throw new ConflictError("Cannot resend a cancelled invitation.");
        }

        if (invitation.status === InvitationStatus.EXPIRED || new Date(invitation.expiresAt) < new Date()) {
            throw new ConflictError("Cannot resend an expired invitation.");
        }

        if (invitation.application.candidate.user.email) {
            const inviteLink = `${env.app.frontendUrl}/candidate/assessments/${invitation.assessment.id}/preparation?token=${invitation.token}&applicationId=${invitation.applicationId}`;
            const template = emailTemplates.assessmentInvitationTemplate(
                invitation.application.candidate.fullName,
                invitation.assessment.title,
                new Date(invitation.expiresAt).toUTCString(),
                inviteLink
            );
            const emailTemplate = {
                to: invitation.application.candidate.user.email,
                ...template
            };
            await EmailService.sendEmail(emailTemplate);
        }
    }

    static async cancelInvitation(id: string): Promise<void> {
        const invitation = await JobAssessmentRepository.findInvitationById(id);
        if (!invitation) {
            throw new NotFoundError("Invitation not found.");
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new ConflictError(`Cannot cancel invitation because its status is ${invitation.status}.`);
        }

        await JobAssessmentRepository.updateInvitationStatus(id, InvitationStatus.CANCELLED);
    }

    static async expireInvitation(id: string): Promise<void> {
        const invitation = await JobAssessmentRepository.findInvitationById(id);
        if (!invitation) {
            throw new NotFoundError("Invitation not found.");
        }

        await JobAssessmentRepository.updateInvitationStatus(id, InvitationStatus.EXPIRED);
    }
}

