import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";

// Dedicated Socket.IO namespace for real-time resume processing.
export const RESUME_SOCKET_NAMESPACE = "/resume-processing";

// Socket.IO event names for resume processing.
export const RESUME_SOCKET_EVENTS = {
    // Client-to-server events
    SUBSCRIBE: "resume:subscribe",
    UNSUBSCRIBE: "resume:unsubscribe",

    // Server-to-client events
    SUBSCRIBED: "resume:subscribed",
    STAGE_CHANGE: "resume:stage",
    COMPLETED: "resume:completed",
    FAILED: "resume:failed",
    ERROR: "resume:error"
} as const;

// Generates the isolated room identifier for a resume.
export function getResumeRoomName(resumeId: string): string {
    return `resume:${resumeId}`;
}

// Human-readable display messages mapped to business processing stages.
export const STAGE_DISPLAY_MESSAGES: Record<ResumeProcessingStage, string> = {
    QUEUED: "Resume queued for processing",
    FETCHING_FILE: "Fetching resume document",
    EXTRACTION: "Extracting text from resume",
    AI_PARSING: "AI analyzing resume content",
    NORMALIZATION: "Normalizing resume data and skills",
    PERSISTENCE: "Saving candidate profile",
    COMPLETED: "Resume processing completed",
    FAILED: "Resume processing failed"
};
