export const RESUME_PROCESSING_QUEUE_NAME = "resume-processing";

export interface ResumeProcessingJobData {
    candidateId: string;
    resumeId: string;
    fileReference: string;
    mimeType: string;
    originalName?: string;
}

export type ResumeProcessingStage =
    | "QUEUED"
    | "FETCHING_FILE"
    | "EXTRACTION"
    | "AI_PARSING"
    | "NORMALIZATION"
    | "PERSISTENCE"
    | "COMPLETED"
    | "FAILED";

export interface ResumeProcessingJobResult {
    success: boolean;
    resumeId: string;
    candidateId: string;
    durationMs: number;
    skillsCount: number;
    experienceCount: number;
    educationCount: number;
    projectsCount: number;
    certificationsCount: number;
}
