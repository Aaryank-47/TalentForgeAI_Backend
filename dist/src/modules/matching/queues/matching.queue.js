import { Queue } from "bullmq";
import { redisConnectionConfig } from "../../../common/queue/redis.config.js";
import { logger } from "../../../common/logger/logger.js";
import { MATCHING_QUEUE_NAME } from "../constants/matching.constants.js";
let matchingQueueInstance = null;
export function getMatchingQueue() {
    if (!matchingQueueInstance) {
        logger.info({ queueName: MATCHING_QUEUE_NAME }, "[MatchingQueue] Initializing BullMQ matching queue...");
        matchingQueueInstance = new Queue(MATCHING_QUEUE_NAME, {
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
    static async addMatchForJobTask(jobId, jobVersion = 1, options) {
        const queue = getMatchingQueue();
        const deterministicJobId = `match-job-${jobId}-v${jobVersion}`;
        const jobData = {
            type: "MATCH_FOR_JOB",
            jobId,
            jobVersion,
            timestamp: Date.now()
        };
        const enqueued = await queue.add("MATCH_FOR_JOB", jobData, {
            jobId: deterministicJobId,
            ...options
        });
        logger.info({
            event: "MATCHING_JOB_ENQUEUED",
            jobId,
            bullmqJobId: enqueued.id,
            jobVersion
        }, `[MatchingQueue] Enqueued matching task for job "${jobId}" (v${jobVersion})`);
        return enqueued;
    }
    /**
     * Enqueue matching job for candidate profile/resume change.
     */
    static async addMatchForCandidateTask(candidateId, candidateVersion = 1, options) {
        const queue = getMatchingQueue();
        const deterministicJobId = `match-candidate-${candidateId}-v${candidateVersion}`;
        const jobData = {
            type: "MATCH_FOR_CANDIDATE",
            candidateId,
            candidateVersion,
            timestamp: Date.now()
        };
        const enqueued = await queue.add("MATCH_FOR_CANDIDATE", jobData, {
            jobId: deterministicJobId,
            ...options
        });
        logger.info({
            event: "MATCHING_CANDIDATE_TASK_ENQUEUED",
            candidateId,
            bullmqJobId: enqueued.id,
            candidateVersion
        }, `[MatchingQueue] Enqueued matching task for candidate "${candidateId}" (v${candidateVersion})`);
        return enqueued;
    }
    /**
     * Enqueue pair recalculation task.
     */
    static async addRecalculatePairTask(candidateId, jobId, options) {
        const queue = getMatchingQueue();
        const deterministicJobId = `match-pair-${candidateId}-${jobId}-${Date.now()}`;
        const jobData = {
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
    static async closeMatchingQueue() {
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
//# sourceMappingURL=matching.queue.js.map