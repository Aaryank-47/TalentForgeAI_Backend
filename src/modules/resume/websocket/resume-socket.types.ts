import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";

export interface ResumeSubscribePayload {
    resumeId: string;
}

export interface ResumeUnsubscribePayload {
    resumeId: string;
}

export interface ResumeStageEventPayload {
    resumeId: string;
    jobId: string;
    candidateId: string;
    stage: ResumeProcessingStage;
    mode?: "DIRECT" | "FALLBACK" | undefined;
    reason?: string | undefined;
    message: string;
    timestamp: string;
}

export interface ResumeCompletedEventPayload {
    resumeId: string;
    jobId: string;
    candidateId: string;
    stage: "COMPLETED";
    message: string;
    timestamp: string;
}

export interface ResumeFailedEventPayload {
    resumeId: string;
    jobId: string;
    candidateId: string;
    stage: "FAILED";
    error: string;
    message: string;
    timestamp: string;
}

export interface ResumeSocketErrorPayload {
    code: "UNAUTHORIZED" | "NOT_FOUND" | "INVALID_PAYLOAD" | "INTERNAL_ERROR";
    message: string;
    resumeId?: string | undefined;
    timestamp: string;
}

/**
 * Payload acknowledged to client on successful subscription (including late join recovery).
 */
export interface ResumeSubscribedResponsePayload {
    resumeId: string;
    status: string; // UPLOADED | QUEUED | PROCESSING | COMPLETED | FAILED
    currentStage?: ResumeProcessingStage | undefined;
    roomName: string;
    parsingStartedAt?: string | null | undefined;
    parsingCompletedAt?: string | null | undefined;
    timestamp: string;
}

