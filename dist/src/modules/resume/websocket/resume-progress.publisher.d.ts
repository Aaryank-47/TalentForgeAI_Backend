import type { Namespace } from "socket.io";
import type { StageChangeMeta } from "../interfaces/resume-pipeline.interface.js";
import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";
/**
 * Publisher responsible for emitting sanitized real-time resume processing progress over Socket.IO.
 * Decouples ResumeProcessingPipeline and ResumeProcessingWorker from Socket.IO specifics.
 */
export declare class ResumeProgressPublisher {
    private static namespaceInstance;
    static setNamespace(namespace: Namespace): void;
    static getNamespace(): Namespace | null;
    /**
     * Emits a stage change event (FETCHING_FILE, EXTRACTION, AI_PARSING, NORMALIZATION, PERSISTENCE) to the resume room.
     * Note: NEVER throws; catches all transport errors to ensure pipeline continuity.
     */
    static publishStageChange(stage: ResumeProcessingStage, meta: StageChangeMeta): Promise<void>;
    /**
     * Emits the COMPLETED event to the resume room.
     * CRITICAL INVARIANT: This must ONLY be invoked after PostgreSQL has successfully recorded parsingStatus = COMPLETED.
     * Note: NEVER throws.
     */
    static publishCompleted(meta: StageChangeMeta): Promise<void>;
    /**
     * Emits a final failure event when resume processing has permanently failed or exhausted retries.
     * Note: NEVER throws.
     */
    static publishFinalFailure(meta: StageChangeMeta, errorMessage: string): Promise<void>;
}
//# sourceMappingURL=resume-progress.publisher.d.ts.map