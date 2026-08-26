import { AttemptStatus } from "@prisma/client";

export interface AssessmentAttemptStartResponse {
    attemptId: string;
    assessmentId: string;
    status: AttemptStatus;
    startedAt: Date;
    endsAt: Date;
    remainingSeconds: number;
}

export interface AssessmentAttemptResponse {
    attemptId: string;
    assessmentId?: string;
    assessmentTitle: string;
    status: AttemptStatus;
    startedAt: Date;
    endsAt: Date;
    remainingSeconds: number;
    currentSectionId: string | null;
    description?: string | null;
    instructions?: string | null;
    sections?: any[];
}

export interface PaginatedAssessmentAttemptResponse {
    attempts: {
        attemptId: string;
        assessmentTitle: string;
        status: AttemptStatus;
        startedAt: Date | null;
        submittedAt?: Date;
        score?: number;
        remainingSeconds?: number;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface AssessmentAttemptResumeResponse {
    attemptId: string;
    remainingSeconds: number;
    currentSectionId: string | null;
}

export interface AssessmentSubmissionResponse {
    attemptId: string;
    status: AttemptStatus;
    submittedAt: Date;
    evaluationStatus: string;
}

export interface AssessmentAnswerResponse {
    answerId: string;
    attemptId: string;
    questionId: string;
    updatedAt: Date;
}

export interface DetailedAssessmentAnswerResponse {
    answerId: string;
    attemptId: string;
    questionId: string;
    selectedOptionIds: string[];
    codeResponse: string | null;
    submissionUrl: string | null;
    attachmentUrls: string[];
    meta: any;
    startedAt: Date | null;
    updatedAt: Date;
}

export interface ClearAssessmentAnswerResponse {
    attemptId: string;
    questionId: string;
}