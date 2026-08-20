import { AssessmentAttemptRepository } from "../repositories/candidateAssessment.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ValidationError } from "../../../common/errors/ValidationError.js";
import { InvitationStatus, AttemptStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { logger } from "../../../common/logger/logger.js";
import { mcqSaveValidationSchema, dsaSaveValidationSchema, projectSaveValidationSchema } from "../dto/candidateAssessment.dto.js";
export class AssessmentAttemptService {
    static async startAssessmentAttempt(userId, token) {
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
    static async getAttemptDetails(userId, userRole, attemptId) {
        const attempt = await AssessmentAttemptRepository.findAttemptById(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }
        if (userRole === UserRole.CANDIDATE) {
            if (attempt.candidate.userId !== userId) {
                throw new ForbiddenError("You do not have permission to view this attempt.");
            }
        }
        else if (userRole === UserRole.EMPLOYER) {
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
    static async getCandidateAttempts(userId, filters) {
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
            const item = {
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
    static async resumeAttempt(userId, attemptId) {
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
    static async submitAttempt(userId, attemptId) {
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
            submittedAt,
            evaluationStatus: updatedAttempt.evaluationStatus
        };
    }
    static async saveAnswer(userId, attemptId, questionId, dto) {
        const attempt = await AssessmentAttemptRepository.findAttemptById(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }
        if (attempt.candidate.userId !== userId) {
            throw new ForbiddenError("You do not have permission to access this attempt.");
        }
        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            if (attempt.status === AttemptStatus.SUBMITTED) {
                throw new ConflictError("Cannot save answer for a submitted attempt.");
            }
            if (attempt.status === AttemptStatus.CANCELLED) {
                throw new ConflictError("Cannot save answer for a cancelled attempt.");
            }
            if (attempt.status === AttemptStatus.EXPIRED) {
                throw new ConflictError("Assessment attempt has expired.");
            }
            throw new ConflictError(`Cannot save answer for an attempt with status: ${attempt.status}`);
        }
        const durationSeconds = (attempt.assessment.durationMinutes || 0) * 60;
        const startedAt = attempt.startedAt || attempt.createdAt;
        const endsAt = new Date(startedAt.getTime() + durationSeconds * 1000);
        const remainingSeconds = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
        if (remainingSeconds <= 0) {
            await AssessmentAttemptRepository.updateAttemptStatus(attemptId, AttemptStatus.EXPIRED);
            throw new ConflictError("Assessment attempt has expired.");
        }
        const sectionItem = await AssessmentAttemptRepository.findQuestionInSectionItem(attempt.assessmentId, questionId);
        if (!sectionItem) {
            throw new ForbiddenError("Question does not belong to the assessment being attempted.");
        }
        const question = await AssessmentAttemptRepository.findQuestionWithDetails(questionId);
        if (!question) {
            throw new NotFoundError("Question not found.");
        }
        let validatedData = {};
        const qType = question.type;
        try {
            if (qType === "MCQ") {
                validatedData = mcqSaveValidationSchema.parse(dto);
                if (!question.mcqDetail) {
                    throw new ValidationError("Question MCQ details not found.");
                }
                const allowedOptionIds = question.mcqDetail.options.map(opt => opt.id);
                for (const optionId of validatedData.selectedOptionIds) {
                    if (!allowedOptionIds.includes(optionId)) {
                        throw new ValidationError(`Option ID '${optionId}' does not belong to this MCQ question.`);
                    }
                }
                if (!question.mcqDetail.allowMultipleCorrectAnswers && validatedData.selectedOptionIds.length > 1) {
                    throw new ValidationError("Multiple correct answers are not allowed for this question.");
                }
            }
            else if (qType === "DSA") {
                validatedData = dsaSaveValidationSchema.parse(dto);
                if (validatedData.codeResponse === undefined) {
                    throw new ValidationError("Code response is required for DSA questions.");
                }
                if (!question.dsaDetail) {
                    throw new ValidationError("Question DSA details not found.");
                }
                const supportedLangIds = question.dsaDetail.supportedLanguages.map(sl => sl.programmingLanguageId);
                const selectedLangId = validatedData.meta?.languageId;
                if (!selectedLangId) {
                    throw new ValidationError("Language ID is required for DSA questions.");
                }
                if (!supportedLangIds.includes(selectedLangId)) {
                    throw new ValidationError(`Programming language ID '${selectedLangId}' is not supported by this question.`);
                }
            }
            else if (qType === "PROJECT" || qType === "MACHINE_CODING") {
                validatedData = projectSaveValidationSchema.parse(dto);
            }
            else {
                throw new ValidationError(`Unsupported question type: ${qType}`);
            }
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                throw new ValidationError("Validation Failed", z.treeifyError(err));
            }
            throw err;
        }
        const existingAnswer = await AssessmentAttemptRepository.findAnswerByAttemptAndQuestion(attemptId, questionId);
        const operation = existingAnswer ? "UPDATE" : "CREATE";
        logger.info({
            attemptId,
            questionId,
            candidateId: attempt.candidateId,
            questionType: qType,
            operation
        }, "Saving assessment answer");
        try {
            const answer = await AssessmentAttemptRepository.upsertAnswer(attemptId, questionId, {
                selectedOptionIds: validatedData.selectedOptionIds || [],
                attachmentUrls: validatedData.attachmentUrls || [],
                codeResponse: validatedData.codeResponse !== undefined ? validatedData.codeResponse : null,
                submissionUrl: validatedData.submissionUrl !== undefined ? validatedData.submissionUrl : null,
                meta: validatedData.meta || null
            });
            return {
                answerId: answer.id,
                attemptId: answer.attemptId,
                questionId: answer.questionId,
                updatedAt: answer.updatedAt
            };
        }
        catch (dbError) {
            throw dbError;
        }
    }
    static async getAnswers(userId, attemptId) {
        const attempt = await AssessmentAttemptRepository.findAttemptById(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }
        if (attempt.candidate.userId !== userId) {
            throw new ForbiddenError("You do not have permission to access this attempt.");
        }
        const answers = await AssessmentAttemptRepository.findAnswersByAttempt(attemptId);
        return answers.map(answer => ({
            answerId: answer.id,
            attemptId: answer.attemptId,
            questionId: answer.questionId,
            selectedOptionIds: answer.selectedOptionIds,
            codeResponse: answer.codeResponse,
            submissionUrl: answer.submissionUrl,
            attachmentUrls: answer.attachmentUrls,
            meta: answer.meta,
            startedAt: answer.startedAt,
            updatedAt: answer.updatedAt
        }));
    }
    static async getAnswer(userId, attemptId, questionId) {
        const attempt = await AssessmentAttemptRepository.findAttemptById(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }
        if (attempt.candidate.userId !== userId) {
            throw new ForbiddenError("You do not have permission to access this attempt.");
        }
        const answer = await AssessmentAttemptRepository.findAnswerByAttemptAndQuestion(attemptId, questionId);
        if (!answer) {
            throw new NotFoundError("Assessment answer not found.");
        }
        return {
            answerId: answer.id,
            attemptId: answer.attemptId,
            questionId: answer.questionId,
            selectedOptionIds: answer.selectedOptionIds,
            codeResponse: answer.codeResponse,
            submissionUrl: answer.submissionUrl,
            attachmentUrls: answer.attachmentUrls,
            meta: answer.meta,
            startedAt: answer.startedAt,
            updatedAt: answer.updatedAt
        };
    }
    static async clearAnswer(userId, attemptId, questionId) {
        const attempt = await AssessmentAttemptRepository.findAttemptById(attemptId);
        if (!attempt) {
            throw new NotFoundError("Assessment attempt not found.");
        }
        if (attempt.candidate.userId !== userId) {
            throw new ForbiddenError("You do not have permission to access this attempt.");
        }
        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            if (attempt.status === AttemptStatus.SUBMITTED) {
                throw new ConflictError("Cannot clear answer for a submitted attempt.");
            }
            if (attempt.status === AttemptStatus.CANCELLED) {
                throw new ConflictError("Cannot clear answer for a cancelled attempt.");
            }
            if (attempt.status === AttemptStatus.EXPIRED) {
                throw new ConflictError("Cannot clear answer for an expired attempt.");
            }
            throw new ConflictError(`Cannot clear answer for an attempt with status: ${attempt.status}`);
        }
        const durationSeconds = (attempt.assessment.durationMinutes || 0) * 60;
        const startedAt = attempt.startedAt || attempt.createdAt;
        const endsAt = new Date(startedAt.getTime() + durationSeconds * 1000);
        const remainingSeconds = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
        if (remainingSeconds <= 0) {
            await AssessmentAttemptRepository.updateAttemptStatus(attemptId, AttemptStatus.EXPIRED);
            throw new ConflictError("Assessment attempt has expired.");
        }
        const answer = await AssessmentAttemptRepository.findAnswerByAttemptAndQuestion(attemptId, questionId);
        if (!answer) {
            throw new NotFoundError("Assessment answer not found.");
        }
        await AssessmentAttemptRepository.deleteAnswer(attemptId, questionId);
        return {
            attemptId,
            questionId
        };
    }
}
//# sourceMappingURL=candidateAssessment.service.js.map