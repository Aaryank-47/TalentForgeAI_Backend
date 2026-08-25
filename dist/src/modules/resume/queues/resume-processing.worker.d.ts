import { Worker, type Job } from "bullmq";
import { ResumeProcessingPipeline } from "../pipelines/resume-processing.pipeline.js";
import { type ResumeProcessingJobData, type ResumeProcessingJobResult } from "./resume-processing.types.js";
import type { StageChangeHandler } from "../interfaces/resume-pipeline.interface.js";
export declare class ResumeProcessingWorker {
    private worker;
    private readonly pipeline;
    private readonly stageChangeHandler;
    constructor(pipeline?: ResumeProcessingPipeline, stageChangeHandler?: StageChangeHandler);
    start(): Worker<ResumeProcessingJobData, ResumeProcessingJobResult>;
    processJob(job: Job<ResumeProcessingJobData, ResumeProcessingJobResult>): Promise<ResumeProcessingJobResult>;
    /**
     * Determines whether an error is permanent (non-retryable) or transient.
     */
    isPermanentError(error: unknown): boolean;
    /**
     * Helper to update Resume status and metadata in database.
     * Note: Critical errors propagate to ensure database failures are not masked.
     */
    private updateResumeStatus;
    /**
     * Attaches lifecycle event listeners to the BullMQ worker instance.
     */
    private attachEventListeners;
    /**
     * Gracefully closes the worker.
     */
    close(): Promise<void>;
}
export declare function getResumeProcessingWorker(): ResumeProcessingWorker;
//# sourceMappingURL=resume-processing.worker.d.ts.map