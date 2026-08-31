import { Worker, UnrecoverableError } from "bullmq";
import { redisConnectionConfig } from "../../../common/queue/redis.config.js";
import { logger } from "../../../common/logger/logger.js";
import { MATCHING_QUEUE_NAME } from "../constants/matching.constants.js";
import { MatchingService } from "../services/matching.service.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
export class MatchingWorker {
    worker = null;
    start() {
        if (this.worker) {
            return this.worker;
        }
        logger.info({ queueName: MATCHING_QUEUE_NAME }, "[MatchingWorker] Initializing matching background worker...");
        this.worker = new Worker(MATCHING_QUEUE_NAME, async (job) => {
            return this.processJob(job);
        }, {
            connection: redisConnectionConfig,
            concurrency: 2
        });
        this.attachEventListeners();
        logger.info("[MatchingWorker] Matching worker started and listening for tasks.");
        return this.worker;
    }
    async processJob(job) {
        const { type, jobId, candidateId } = job.data;
        const startTime = performance.now();
        logger.info({
            event: "MATCHING_WORKER_JOB_STARTED",
            bullmqJobId: job.id,
            type,
            jobId,
            candidateId,
            attempt: job.attemptsMade + 1
        }, `[MatchingWorker] Processing task "${type}" (BullMQ Job ID: ${job.id})`);
        try {
            let result;
            if (type === "MATCH_FOR_JOB") {
                if (!jobId)
                    throw new Error("jobId is required for MATCH_FOR_JOB");
                result = await MatchingService.matchForJob(jobId);
            }
            else if (type === "MATCH_FOR_CANDIDATE") {
                if (!candidateId)
                    throw new Error("candidateId is required for MATCH_FOR_CANDIDATE");
                result = await MatchingService.matchForCandidate(candidateId);
            }
            else if (type === "RECALCULATE_PAIR") {
                if (!candidateId || !jobId)
                    throw new Error("candidateId and jobId are required for RECALCULATE_PAIR");
                result = await MatchingService.recalculatePair(candidateId, jobId);
            }
            else {
                throw new Error(`Unknown matching task type "${type}"`);
            }
            const durationMs = Math.round(performance.now() - startTime);
            logger.info({
                event: "MATCHING_WORKER_JOB_SUCCESS",
                bullmqJobId: job.id,
                type,
                durationMs,
                result
            }, `[MatchingWorker] Task "${type}" completed successfully in ${durationMs}ms`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown matching error";
            logger.error({
                event: "MATCHING_WORKER_JOB_FAILED",
                bullmqJobId: job.id,
                type,
                jobId,
                candidateId,
                err: errorMessage
            }, `[MatchingWorker] Task "${type}" failed: ${errorMessage}`);
            if (error instanceof NotFoundError) {
                // If record no longer exists in database, do not retry indefinitely
                throw new UnrecoverableError(errorMessage);
            }
            throw error;
        }
    }
    attachEventListeners() {
        if (!this.worker)
            return;
        this.worker.on("completed", (job) => {
            logger.info({
                event: "MATCHING_WORKER_COMPLETED",
                bullmqJobId: job.id
            }, `[MatchingWorker] Job "${job.id}" completed`);
        });
        this.worker.on("failed", (job, error) => {
            logger.error({
                event: "MATCHING_WORKER_FAILED",
                bullmqJobId: job?.id,
                err: error.message
            }, `[MatchingWorker] Job "${job?.id}" permanently failed or retry scheduled: ${error.message}`);
        });
        this.worker.on("error", (error) => {
            logger.error({ err: error }, "[MatchingWorker] Internal matching worker error");
        });
        this.worker.on("stalled", (jobId) => {
            logger.warn({ jobId }, `[MatchingWorker] Job "${jobId}" stalled and will be re-processed`);
        });
    }
    async close() {
        if (this.worker) {
            logger.info("[MatchingWorker] Closing matching worker...");
            await this.worker.close();
            this.worker = null;
            logger.info("[MatchingWorker] Matching worker closed gracefully.");
        }
    }
}
let matchingWorkerInstance = null;
export function getMatchingWorker() {
    if (!matchingWorkerInstance) {
        matchingWorkerInstance = new MatchingWorker();
    }
    return matchingWorkerInstance;
}
//# sourceMappingURL=matching.worker.js.map