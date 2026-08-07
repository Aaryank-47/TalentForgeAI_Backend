import { AssessmentAttemptRepository } from "../repositories/assessmentAttemp.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { InvitationStatus } from "@prisma/client";

export interface AssessmentAttemptStartResponse {
    attemptId: string;
    startedAt: Date;
    remainingTime: number;
}

export class AssessmentAttemptService {
    static async startAssessment(token: string): Promise<AssessmentAttemptStartResponse> {
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

        const latestAttempt = invitation.application.assessmentAttempts[0];
        const durationSeconds = (invitation.assessment.durationMinutes || 0) * 60;

        if (latestAttempt) {
            if (latestAttempt.status === "SUBMITTED") {
                if (invitation.status !== InvitationStatus.SUBMITTED) {
                    await AssessmentAttemptRepository.updateInvitationStatus(invitation.id, InvitationStatus.SUBMITTED);
                }
                throw new ConflictError("Assessment has already been submitted.");
            }

            if (latestAttempt.status === "IN_PROGRESS") {
                const elapsedSeconds = Math.floor((Date.now() - new Date(latestAttempt.startedAt || latestAttempt.createdAt).getTime()) / 1000);
                const remainingTime = Math.max(0, durationSeconds - elapsedSeconds);
                return {
                    attemptId: latestAttempt.id,
                    startedAt: latestAttempt.startedAt || latestAttempt.createdAt,
                    remainingTime
                };
            }
        }

        const attempt = await AssessmentAttemptRepository.createAssessmentAttempt({
            candidateId: invitation.application.candidateId,
            applicationId: invitation.applicationId,
            assessmentId: invitation.assessmentId,
            status: "IN_PROGRESS",
            startedAt: new Date(),
            attemptNumber: latestAttempt ? latestAttempt.attemptNumber + 1 : 1
        });

        return {
            attemptId: attempt.id,
            startedAt: attempt.startedAt || attempt.createdAt,
            remainingTime: durationSeconds
        };
    }
}
