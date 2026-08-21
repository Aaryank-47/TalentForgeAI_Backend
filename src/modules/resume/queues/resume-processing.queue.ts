import { Queue, type JobsOptions } from "bullmq";
import { redisConnectionConfig } from "../../../common/queue/redis.config.js";
import { logger } from "../../../common/logger/logger.js";
import env from "../../../config/env.js";
import {
    RESUME_PROCESSING_QUEUE_NAME,
    type ResumeProcessingJobData
} from "./resume-processing.types.js";

/**
 * Default BullMQ job options for AI resume processing.
 * - Attempts: 3 retries for transient errors.
 * - Exponential backoff: starts at configured delay (default 5000ms) with exponential increase.
 * - Retention: Completed jobs stored up to 24 hours (max 1,000), failed jobs stored up to 7 days (max 5,000) for debugging.
 */
export const DEFAULT_RESUME_JOB_OPTIONS: JobsOptions = {
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

let resumeProcessingQueueInstance: Queue<ResumeProcessingJobData> | null = null;


// Retrieves or initializes the singleton Resume Processing BullMQ Queue.
export function getResumeProcessingQueue(): Queue<ResumeProcessingJobData> {
    if (!resumeProcessingQueueInstance) {
        resumeProcessingQueueInstance = new Queue<ResumeProcessingJobData>(RESUME_PROCESSING_QUEUE_NAME, {
            connection: redisConnectionConfig
        });

        resumeProcessingQueueInstance.on("error", (error) => {
            logger.error({ err: error }, "[ResumeProcessingQueue] Queue connection error");
        });
    }

    return resumeProcessingQueueInstance;
}

/**
 * Adds a resume processing job to the BullMQ queue with deduplication based on resumeId.
 *
 * @param data Typed resume processing payload
 * @returns The enqueued BullMQ job
 */
export async function addResumeProcessingJob(data: ResumeProcessingJobData) {
    const queue = getResumeProcessingQueue();
    const jobId = `resume-processing:${data.resumeId}`;

    logger.info(
        {
            event: "JOB_CREATED",
            jobId,
            resumeId: data.resumeId,
            candidateId: data.candidateId,
            mimeType: data.mimeType,
            originalName: data.originalName
        },
        `[ResumeProcessingQueue] Enqueuing resume processing job for resume "${data.resumeId}"`
    );
    
    const job = await queue.add("process-resume", data, {
        ...DEFAULT_RESUME_JOB_OPTIONS,
        jobId
    });

    return job;
}

// Closes the Resume Processing Queue connection cleanly.
export async function closeResumeProcessingQueue(): Promise<void> {
    if (resumeProcessingQueueInstance) {
        logger.info("[ResumeProcessingQueue] Closing queue connection...");
        await resumeProcessingQueueInstance.close();
        resumeProcessingQueueInstance = null;
        logger.info("[ResumeProcessingQueue] Queue connection closed.");
    }
}
