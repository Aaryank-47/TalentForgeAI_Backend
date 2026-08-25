import { Queue, type JobsOptions } from "bullmq";
import { type ResumeProcessingJobData } from "./resume-processing.types.js";
/**
 * Default BullMQ job options for AI resume processing.
 * - Attempts: 3 retries for transient errors.
 * - Exponential backoff: starts at configured delay (default 5000ms) with exponential increase.
 * - Retention: Completed jobs stored up to 24 hours (max 1,000), failed jobs stored up to 7 days (max 5,000) for debugging.
 */
export declare const DEFAULT_RESUME_JOB_OPTIONS: JobsOptions;
export declare function getResumeProcessingQueue(): Queue<ResumeProcessingJobData>;
export interface AddResumeJobOptions {
    jobId?: string;
}
/**
 * Adds a resume processing job to the BullMQ queue.
 * - For initial upload: uses deterministic jobId `resume-processing-${data.resumeId}` to preserve idempotency.
 * - For manual retry: accepts a unique retry jobId (e.g. `resume-processing-${data.resumeId}-retry-1`).
 *
 * @param data Typed resume processing payload
 * @param options Optional job options including custom jobId
 * @returns The enqueued BullMQ job
 */
export declare function addResumeProcessingJob(data: ResumeProcessingJobData, options?: AddResumeJobOptions): Promise<import("bullmq").Job<ResumeProcessingJobData, any, string>>;
export declare function closeResumeProcessingQueue(): Promise<void>;
//# sourceMappingURL=resume-processing.queue.d.ts.map