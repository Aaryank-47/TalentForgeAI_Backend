import { ATSIntegrationRepository } from "../repositories/atsIntegration.repository.js";
import { ApplicationWorkflowRepository } from "../../hiring-workflow/repositories/application-workflow.repository.js";
import { ApplicationRepository } from "../../application/repositories/application.repository.js";
import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { AttemptStatus, EvaluationStatus, UserRole } from "@prisma/client";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";
import { logger } from "../../../common/logger/logger.js";
import type {
    ApplicationAssessmentResultResponse,
    ATSAssessmentProcessingResult,
    AssessmentOutcome
} from "../interfaces/atsIntegration.interface.js";

export class AssessmentOutcomeService {
    static async determineOutcome(attemptId: string): Promise<AssessmentOutcome> {
        const attempt = await ATSIntegrationRepository.findAttemptWithAssessmentAndApplication(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }

        if (attempt.status !== AttemptStatus.SUBMITTED || attempt.evaluationStatus !== EvaluationStatus.COMPLETED) {
            throw new ConflictError("Assessment has not been fully evaluated.");
        }

        const percentage = attempt.percentage ?? 0;
        const passingScore = attempt.assessment.passingScore ?? 0.0;

        if (percentage >= passingScore) {
            return {
                outcome: "PASSED",
                action: "MOVE_TO_NEXT_STAGE"
            };
        } else {
            return {
                outcome: "FAILED",
                action: "REJECT_APPLICATION"
            };
        }
    }
}

export class AssessmentATSIntegrationService {
    static async getAssessmentResultByApplication(
        userId: string,
        role: UserRole,
        applicationId: string
    ): Promise<ApplicationAssessmentResultResponse> {
        const application = await ATSIntegrationRepository.findApplicationById(applicationId);
        if (!application) {
            throw new NotFoundError("Application not found.");
        }

        // Authorize
        if (role === UserRole.CANDIDATE) {
            if (application.candidate.userId !== userId) {
                throw new ForbiddenError("You do not have permission to view this application assessment result.");
            }
        } else if (role === UserRole.EMPLOYER) {
            const member = await ATSIntegrationRepository.findActiveCompanyMember(userId, application.job.companyId);
            if (!member) {
                throw new ForbiddenError("You do not have permission to view this application assessment result.");
            }
        }

        const attempt = await ATSIntegrationRepository.findCompletedAttemptByApplication(applicationId);
        if (!attempt) {
            throw new NotFoundError("No completed assessment attempt found for this application.");
        }

        return {
            applicationId,
            assessmentAttemptId: attempt.id,
            assessmentId: attempt.assessmentId,
            assessmentTitle: attempt.assessment.title,
            score: attempt.overallScore ?? 0,
            percentage: attempt.percentage ?? 0,
            passed: attempt.passed ?? false,
            evaluationStatus: attempt.evaluationStatus,
            submittedAt: attempt.submittedAt || attempt.createdAt,
            evaluatedAt: attempt.updatedAt
        };
    }

    static async processAssessmentResult(attemptId: string): Promise<ATSAssessmentProcessingResult> {
        logger.info({ attemptId }, "Processing ATS assessment result...");

        const attempt = await ATSIntegrationRepository.findAttemptWithAssessmentAndApplication(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }

        const outcome = await AssessmentOutcomeService.determineOutcome(attemptId);
        const applicationWorkflow = await ATSIntegrationRepository.findApplicationWorkflow(attempt.applicationId);

        if (!applicationWorkflow) {
            logger.warn({ attemptId, applicationId: attempt.applicationId }, "No ApplicationWorkflow stage maps to this application. Stage movement skipped.");
            return {
                applicationId: attempt.applicationId,
                attemptId,
                result: outcome.outcome,
                currentStageId: null,
                nextStageId: null,
                action: outcome.action
            };
        }

        const workflowId = attempt.application.job.workflowId;
        if (!workflowId) {
            logger.warn({ attemptId, jobId: attempt.application.jobId }, "No workflow assigned to this job.");
            return {
                applicationId: attempt.applicationId,
                attemptId,
                result: outcome.outcome,
                currentStageId: applicationWorkflow.workflowStageId,
                nextStageId: null,
                action: outcome.action
            };
        }

        const creatorMember = await prisma.companyMember.findUnique({
            where: { id: attempt.assessment.createdById },
            select: { userId: true }
        });
        
        let employerId = "";
        if (creatorMember) {
            const employerProfile = await prisma.employer.findUnique({
                where: { userId: creatorMember.userId },
                select: { id: true }
            });
            if (employerProfile) {
                employerId = employerProfile.id;
            }
        }

        const stages = await ATSIntegrationRepository.findWorkflowStagesOrdered(workflowId);
        const currentStageIndex = stages.findIndex(s => s.id === applicationWorkflow.workflowStageId);

        if (outcome.outcome === "PASSED") {
            if (currentStageIndex !== -1 && currentStageIndex < stages.length - 1) {
                const nextStage = stages[currentStageIndex + 1];

                if (nextStage) {
                    // Auto transition candidate to next stage
                    await ApplicationWorkflowRepository.updateApplicationWorkflow(
                        employerId,
                        attempt.applicationId,
                        applicationWorkflow.workflowStageId,
                        nextStage.id,
                        `Auto transitioned - Assessment Passed (${attempt.percentage}%)`
                    );

                    logger.info({ attemptId, nextStageId: nextStage.id }, "Successfully moved application to next workflow stage.");
                    return {
                        applicationId: attempt.applicationId,
                        attemptId,
                        result: "PASSED",
                        currentStageId: applicationWorkflow.workflowStageId,
                        nextStageId: nextStage.id,
                        action: "MOVE_TO_NEXT_STAGE"
                    };
                }
            }

            logger.info({ attemptId }, "Application is already at the final stage. Transition skipped.");
            return {
                applicationId: attempt.applicationId,
                attemptId,
                result: "PASSED",
                currentStageId: applicationWorkflow.workflowStageId,
                nextStageId: null,
                action: "RECRUITER_REVIEW"
            };
        } else {
            // Rejection
            await ApplicationRepository.updateApplicationStatus(attempt.applicationId, ApplicationStatus.REJECTED);

            // Save history log entry
            await prisma.workflowHistory.create({
                data: {
                    applicationWorkflowId: applicationWorkflow.id,
                    fromStageId: applicationWorkflow.workflowStageId,
                    toStageId: applicationWorkflow.workflowStageId,
                    movedByEmployerId: employerId || null,
                    comment: `Auto rejected - Assessment Failed (${attempt.percentage}%)`
                }
            });

            logger.info({ attemptId }, "Successfully auto rejected application.");
            return {
                applicationId: attempt.applicationId,
                attemptId,
                result: "FAILED",
                currentStageId: applicationWorkflow.workflowStageId,
                nextStageId: null,
                action: "REJECT_APPLICATION"
            };
        }
    }
}
