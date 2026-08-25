import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";
import type { ResumeProcessingProgressState } from "../interfaces/resume-pipeline.interface.js";
export declare class ResumeProcessingStateService {
    private static redisClient;
    private static getClient;
    private static getKey;
    static setCurrentStage(resumeId: string, stage: ResumeProcessingStage, customMessage?: string): Promise<void>;
    static getCurrentStage(resumeId: string): Promise<ResumeProcessingProgressState | null>;
    static clearCurrentStage(resumeId: string): Promise<void>;
    static markFailed(resumeId: string, errorMessage?: string): Promise<void>;
}
//# sourceMappingURL=resume-processing-state.service.d.ts.map