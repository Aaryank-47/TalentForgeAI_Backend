import type { ResumeParsingResult } from "./resume-parser.interface.js";
import type { ResumePersistenceResult } from "./resume-persistence.interface.js";
import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";

export interface StageChangeMeta {
    jobId: string;
    resumeId: string;
    candidateId: string;
    mode?: "DIRECT" | "FALLBACK";
    reason?: string;
}

export type StageChangeHandler = (
    stage: ResumeProcessingStage,
    meta: StageChangeMeta
) => Promise<void> | void;

export interface PipelineExecutionResult {
    parsedData: ResumeParsingResult;
    normalizedData: ResumeParsingResult;
    persistenceResult: ResumePersistenceResult;
    durationMs: number;
}

export interface ResumeProcessingProgressState {
    resumeId: string;
    status: "PROCESSING" | "COMPLETED" | "FAILED" | "QUEUED";
    stage: ResumeProcessingStage;
    progress: number;
    message: string;
    updatedAt: string;
}
