import { AssessmentAttemptRepository } from "../repositories/assessmentAttemp.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { InvitationStatus, AttemptStatus, UserRole } from "@prisma/client";
import type {
    AssessmentAttemptStartResponse,
    AssessmentAttemptResponse,
    PaginatedAssessmentAttemptResponse,
    AssessmentAttemptResumeResponse,
    AssessmentSubmissionResponse
} from "../interfaces/assessmentAttempt.interface.js";


export class AssessmentAttemptService {
    static async startAssessmentAttempt(
        userId: string, 
        token: string
    ): Promise<AssessmentAttemptStartResponse> {
        const candidate = await AssessmentAttemptRepository.findCandidateByUserId(userId);
        if (!candidate) {
            throw new NotFoundError("Candidate profile not found.");
        }

        const invitation = await AssessmentAttemptRepository.findInvitationByToken(token);
        if (!invitation) {
            throw new NotFoundError("Invitation token not found.");
        }

        if (invitation.status === InvitationStatus.CANCELLED) {
            throw new ConflictError("Invitation has been cancelled.");
        }

        if (invitation.status === InvitationStatus.EXPIRED || new Date(invitation.expiresAt) < new Date()) {
            if (invitation.status === InvitationStatus.PENDING) {
                await AssessmentAttemptRepository.updateInvitationStatus(invitation.id, InvitationStatus.EXPIRED);
            }
            throw new ConflictError("Invitation has expired.");
        }

        if (!invitation.assessment || invitation.assessment.deletedAt || invitation.assessment.status !== "PUBLISHED") {
            throw new ConflictError("Assessment is not published or has been deleted.");
        }

        if (invitation.application.candidate.userId !== userId) {
            throw new ForbiddenError("You are not authorized to start this assessment.");
        }

        const activeAttempt = invitation.application.assessmentAttempts.find(att => att.status === AttemptStatus.IN_PROGRESS);
        if (activeAttempt) {
            throw new ConflictError("An attempt is already in progress.");
        }

        const attemptCount = invitation.application.assessmentAttempts.length;
        const submittedAttempt = invitation.application.assessmentAttempts.find(att => att.status === AttemptStatus.SUBMITTED);
        if (submittedAttempt || attemptCount >= 1) {
            throw new ConflictError("Maximum attempt count exceeded.");
        }

        const durationMinutes = invitation.assessment.durationMinutes || 0;
        const startedAt = new Date();
        const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
        const remainingSeconds = durationMinutes * 60;

        const attempt = await AssessmentAttemptRepository.createAssessmentAttempt({
            candidateId: invitation.application.candidateId,
            applicationId: invitation.applicationId,
            assessmentId: invitation.assessmentId,
            status: AttemptStatus.IN_PROGRESS,
            startedAt,
            attemptNumber: attemptCount + 1
        });

        return {
            attemptId: attempt.id,
            assessmentId: attempt.assessmentId,
            status: attempt.status,
            startedAt,
            endsAt,
            remainingSeconds
        };
    }

    static async getAttemptDetails(
        userId: string, 
        userRole: UserRole, 
        attemptId: string
    ): Promise<AssessmentAttemptResponse> {
        const attempt = await AssessmentAttemptRepository.findAttemptById(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }

        if (userRole === UserRole.CANDIDATE) {
            if (attempt.candidate.userId !== userId) {
                throw new ForbiddenError("You do not have permission to view this attempt.");
            }
        } else if (userRole === UserRole.EMPLOYER) {
            const member = await AssessmentAttemptRepository.checkActiveCompanyMember(userId, attempt.assessment.companyId);
            if (!member) {
                throw new ForbiddenError("You do not have permission to view this attempt.");
            }
        }

        const durationSeconds = (attempt.assessment.durationMinutes || 0) * 60;
        const startedAt = attempt.startedAt || attempt.createdAt;
        const endsAt = new Date(startedAt.getTime() + durationSeconds * 1000);
        const remainingSeconds = attempt.status === AttemptStatus.IN_PROGRESS
            ? Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000))
            : 0;

        return {
            attemptId: attempt.id,
            assessmentTitle: attempt.assessment.title,
            status: attempt.status,
            startedAt,
            endsAt,
            remainingSeconds,
            currentSectionId: attempt.currentSectionId,
            description: attempt.assessment.description,
            instructions: attempt.assessment.instructions
        };
    }

    static async getCandidateAttempts(
        userId: string, 
        filters: { 
            status?: AttemptStatus; 
            page?: number; 
            limit?: number 
        }): Promise<PaginatedAssessmentAttemptResponse> {
        
        const candidate = await AssessmentAttemptRepository.findCandidateByUserId(userId);
        if (!candidate) {
            throw new NotFoundError("Candidate profile not found.");
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const attempts = await AssessmentAttemptRepository.findAttemptsByCandidate(candidate.id, filters, skip, limit);
        const total = await AssessmentAttemptRepository.countAttemptsByCandidate(candidate.id, filters);

        const attemptsData = attempts.map(attempt => {
            const durationSeconds = (attempt.assessment.durationMinutes || 0) * 60;
            const startedAt = attempt.startedAt || attempt.createdAt;
            const endsAt = new Date(startedAt.getTime() + durationSeconds * 1000);
            const remainingSeconds = attempt.status === AttemptStatus.IN_PROGRESS
                ? Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000))
                : undefined;

            const item: any = {
                attemptId: attempt.id,
                assessmentTitle: attempt.assessment.title,
                status: attempt.status,
                startedAt: attempt.startedAt
            };

            if (attempt.submittedAt !== null && attempt.submittedAt !== undefined) {
                item.submittedAt = attempt.submittedAt;
            }
            if (attempt.overallScore !== null && attempt.overallScore !== undefined) {
                item.score = attempt.overallScore;
            }
            if (remainingSeconds !== undefined) {
                item.remainingSeconds = remainingSeconds;
            }

            return item;
        });

        return {
            attempts: attemptsData,
            pagination: {
                page,
                limit,
                total
            }
        };
    }

    static async resumeAttempt(userId: string, attemptId: string): Promise<AssessmentAttemptResumeResponse> {
        const attempt = await AssessmentAttemptRepository.findAttemptById(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }

        if (attempt.candidate.userId !== userId) {
            throw new ForbiddenError("You do not have permission to resume this attempt.");
        }

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new ConflictError("Only attempts in progress can be resumed.");
        }

        const durationSeconds = (attempt.assessment.durationMinutes || 0) * 60;
        const startedAt = attempt.startedAt || attempt.createdAt;
        const endsAt = new Date(startedAt.getTime() + durationSeconds * 1000);
        const remainingSeconds = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
        
        if (remainingSeconds <= 0) {
            await AssessmentAttemptRepository.updateAttemptStatus(attemptId, AttemptStatus.EXPIRED);
            throw new ConflictError("Assessment time has expired.");
        }

        const invitation = await AssessmentAttemptRepository.findInvitationByApplicationAndAssessment(attempt.applicationId, attempt.assessmentId);
        if (!invitation || invitation.status === InvitationStatus.CANCELLED || invitation.status === InvitationStatus.EXPIRED || new Date(invitation.expiresAt) < new Date()) {
            throw new ConflictError("Invitation is no longer valid.");
        }

        return {
            attemptId: attempt.id,
            remainingSeconds,
            currentSectionId: attempt.currentSectionId
        };
    }

    static async submitAttempt(userId: string, attemptId: string): Promise<AssessmentSubmissionResponse> {
        const attempt = await AssessmentAttemptRepository.findAttemptById(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }

        if (attempt.candidate.userId !== userId) {
            throw new ForbiddenError("You do not have permission to submit this attempt.");
        }

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new ConflictError("Only attempts in progress can be submitted.");
        }

        const submittedAt = new Date();
        const updatedAttempt = await AssessmentAttemptRepository.updateAttemptStatus(attemptId, AttemptStatus.SUBMITTED, submittedAt);

        const invitation = await AssessmentAttemptRepository.findInvitationByApplicationAndAssessment(attempt.applicationId, attempt.assessmentId);
        if (invitation && invitation.status !== InvitationStatus.SUBMITTED) {
            await AssessmentAttemptRepository.updateInvitationStatus(invitation.id, InvitationStatus.SUBMITTED);
        }

        return {
            attemptId: updatedAttempt.id,
            status: updatedAttempt.status,
            submittedAt
        };
    }
}
