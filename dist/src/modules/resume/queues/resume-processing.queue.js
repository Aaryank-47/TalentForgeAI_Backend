import { Queue } from "bullmq";
import { redisConnectionConfig } from "../../../common/queue/redis.config.js";
import { logger } from "../../../common/logger/logger.js";
import env from "../../../config/env.js";
import { RESUME_PROCESSING_QUEUE_NAME } from "./resume-processing.types.js";
/**
 * Default BullMQ job options for AI resume processing.
 * - Attempts: 3 retries for transient errors.
 * - Exponential backoff: starts at configured delay (default 5000ms) with exponential increase.
 * - Retention: Completed jobs stored up to 24 hours (max 1,000), failed jobs stored up to 7 days (max 5,000) for debugging.
 */
export const DEFAULT_RESUME_JOB_OPTIONS = {
    attempts: env.queue.resumeJobAttempts,
    backoff: {
        type: "exponential",
        delay: env.queue.resumeJobBackoffDelayMs
    },
    removeOnComplete: {
        count: 1000,
        age: 24 * 3600
    },
    removeOnFail: {
        count: 5000,
        age: 7 * 24 * 3600
    }
};
let resumeProcessingQueueInstance = null;
// Retrieves or initializes the singleton Resume Processing BullMQ Queue.
export function getResumeProcessingQueue() {
    if (!resumeProcessingQueueInstance) {
        resumeProcessingQueueInstance = new Queue(RESUME_PROCESSING_QUEUE_NAME, {
            connection: redisConnectionConfig
        });
        resumeProcessingQueueInstance.on("error", (error) => {
            logger.error({ err: error }, "[ResumeProcessingQueue] Queue connection error");
        });
    }
    return resumeProcessingQueueInstance;
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
export async function addResumeProcessingJob(data, options) {
    const queue = getResumeProcessingQueue();
    const jobId = options?.jobId ?? `resume-processing-${data.resumeId}`;
    logger.info({
        event: "JOB_CREATED",
        jobId,
        resumeId: data.resumeId,
        candidateId: data.candidateId,
        mimeType: data.mimeType,
        originalName: data.originalName,
        isCustomJobId: Boolean(options?.jobId)
    }, `[ResumeProcessingQueue] Enqueuing resume processing job for resume "${data.resumeId}" (Job: ${jobId})`);
    const job = await queue.add("process-resume", data, {
        ...DEFAULT_RESUME_JOB_OPTIONS,
        jobId
    });
    // Diagnostic runtime inspection
    try {
        const jobState = await job.getState();
        const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');
        const retrievedJob = await queue.getJob(job.id);
        logger.info({
            event: "JOB_ENQUEUED_DIAGNOSTIC",
            jobId: job.id,
            queueName: queue.name,
            redisHost: env.redis.host,
            redisPort: env.redis.port,
            jobState,
            attemptsMade: job.attemptsMade,
            delay: job.opts.delay ?? 0,
            existsInQueue: Boolean(retrievedJob),
            queueCounts: counts
        }, `[ResumeProcessingQueue] Job "${job.id}" enqueued in queue "${queue.name}" (State: "${jobState}")`);
    }
    catch (diagError) {
        logger.warn({ err: diagError }, "[ResumeProcessingQueue] Diagnostic logging failed (non-fatal)");
    }
    return job;
}
// Closes the Resume Processing Queue connection cleanly.
export async function closeResumeProcessingQueue() {
    if (resumeProcessingQueueInstance) {
        logger.info("[ResumeProcessingQueue] Closing queue connection...");
        await resumeProcessingQueueInstance.close();
        resumeProcessingQueueInstance = null;
        logger.info("[ResumeProcessingQueue] Queue connection closed.");
    }
}
//# sourceMappingURL=resume-processing.queue.js.map