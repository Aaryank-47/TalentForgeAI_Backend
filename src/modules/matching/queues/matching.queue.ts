import { Queue, type JobsOptions, type Job } from "bullmq";
import { redisConnectionConfig } from "../../../common/queue/redis.config.js";
import { logger } from "../../../common/logger/logger.js";
import { MATCHING_QUEUE_NAME } from "../constants/matching.constants.js";
import type { MatchingJobData } from "../interfaces/matching.interface.js";

let matchingQueueInstance: Queue<MatchingJobData> | null = null;

export function getMatchingQueue(): Queue<MatchingJobData> {
    if (!matchingQueueInstance) {
        logger.info(
            { queueName: MATCHING_QUEUE_NAME },
            "[MatchingQueue] Initializing BullMQ matching queue..."
        );

        matchingQueueInstance = new Queue<MatchingJobData>(MATCHING_QUEUE_NAME, {
            connection: redisConnectionConfig,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 3000
                },
                removeOnComplete: {
                    age: 3600 * 24, 
                    count: 1000
                },
                removeOnFail: {
                    age: 3600 * 48,
                    count: 2000
                }
            }
        });
    }

    return matchingQueueInstance;
}

export class MatchingQueueService {
    /**
     * Enqueue matching job for a newly published or updated job.
     * Uses deterministic job ID to prevent duplicate concurrent executions for same version.
     */
    public static async addMatchForJobTask(
        jobId: string,
        jobVersion = 1,
        options?: Partial<JobsOptions>
    ): Promise<Job<MatchingJobData>> {
        const queue = getMatchingQueue();
        const deterministicJobId = `match-job-${jobId}-v${jobVersion}`;

        const jobData: MatchingJobData = {
            type: "MATCH_FOR_JOB",
            jobId,
            jobVersion,
            timestamp: Date.now()
        };

        const enqueued = await queue.add("MATCH_FOR_JOB", jobData, {
            jobId: deterministicJobId,
            ...options
        });

        logger.info(
            {
                event: "MATCHING_JOB_ENQUEUED",
                jobId,
                bullmqJobId: enqueued.id,
                jobVersion
            },
            `[MatchingQueue] Enqueued matching task for job "${jobId}" (v${jobVersion})`
        );

        return enqueued;
    }

    /**
     * Enqueue matching job for candidate profile/resume change.
     */
    public static async addMatchForCandidateTask(
        candidateId: string,
        candidateVersion = 1,
        options?: Partial<JobsOptions>
    ): Promise<Job<MatchingJobData>> {
        const queue = getMatchingQueue();
        const deterministicJobId = `match-candidate-${candidateId}-v${candidateVersion}`;

        const jobData: MatchingJobData = {
            type: "MATCH_FOR_CANDIDATE",
            candidateId,
            candidateVersion,
            timestamp: Date.now()
        };

        const enqueued = await queue.add("MATCH_FOR_CANDIDATE", jobData, {
            jobId: deterministicJobId,
            ...options
        });

        logger.info(
            {
                event: "MATCHING_CANDIDATE_TASK_ENQUEUED",
                candidateId,
                bullmqJobId: enqueued.id,
                candidateVersion
            },
            `[MatchingQueue] Enqueued matching task for candidate "${candidateId}" (v${candidateVersion})`
        );

        return enqueued;
    }

    /**
     * Enqueue pair recalculation task.
     */
    public static async addRecalculatePairTask(
        candidateId: string,
        jobId: string,
        options?: Partial<JobsOptions>
    ): Promise<Job<MatchingJobData>> {
        const queue = getMatchingQueue();
        const deterministicJobId = `match-pair-${candidateId}-${jobId}-${Date.now()}`;

        const jobData: MatchingJobData = {
            type: "RECALCULATE_PAIR",
            candidateId,
            jobId,
            timestamp: Date.now()
        };

        return queue.add("RECALCULATE_PAIR", jobData, {
            jobId: deterministicJobId,
            ...options
        });
    }

    public static async closeMatchingQueue(): Promise<void> {
        if (matchingQueueInstance) {
            logger.info("[MatchingQueue] Closing matching queue connection...");
            await matchingQueueInstance.close();
            matchingQueueInstance = null;
            logger.info("[MatchingQueue] Matching queue closed successfully.");
        }
    }
}

export const addMatchForJobTask = MatchingQueueService.addMatchForJobTask.bind(MatchingQueueService);
export const addMatchForCandidateTask = MatchingQueueService.addMatchForCandidateTask.bind(MatchingQueueService);
export const addRecalculatePairTask = MatchingQueueService.addRecalculatePairTask.bind(MatchingQueueService);
export const closeMatchingQueue = MatchingQueueService.closeMatchingQueue.bind(MatchingQueueService);
