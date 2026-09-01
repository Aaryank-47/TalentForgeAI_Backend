import { Queue, Worker } from "bullmq";
import { redisConnectionConfig } from "../../../../common/queue/redis.config.js";
import { AIInterviewQuestionsRepository } from "../repositories/ai.interview.repository.js";
import { AIInterviewFinalEvaluationService } from "./ai.final.evaluation.service.js";
let timeoutQueueInstance = null;
export function getInterviewTimeoutQueue() {
    if (!timeoutQueueInstance || timeoutQueueInstance.closing) {
        timeoutQueueInstance = new Queue("ai-interview-timeout", {
            connection: redisConnectionConfig
        });
    }
    return timeoutQueueInstance;
}
export class AIInterviewTimeoutWorker {
    static intervalTimer = null;
    static worker = null;
    static socketIoInstance = null;
    /**
     * Tracks every in-flight checkAndExpireSessions() promise so that
     * stopWorker() can await all of them before returning, preventing
     * post-teardown Prisma/Socket operations in Jest.
     */
    static activeScans = new Set();
    static async scheduleTimeoutJob(sessionId, durationMinutes) {
        const delayMs = durationMinutes * 60 * 1000;
        try {
            const queue = getInterviewTimeoutQueue();
            await queue.add("expire-session", { sessionId }, {
                jobId: `timeout-${sessionId}`,
                delay: Math.max(0, delayMs),
                removeOnComplete: true,
                removeOnFail: false
            });
            console.log(`[AIInterviewTimeoutWorker] Scheduled BullMQ timeout job for session "${sessionId}" in ${durationMinutes} mins.`);
        }
        catch (error) {
            console.warn(`[AIInterviewTimeoutWorker] Could not schedule BullMQ job (Redis offline?): ${error.message}. DB request guard will handle expiration.`);
        }
    }
    static async processSessionTimeout(sessionId, io) {
        const targetIo = io || this.socketIoInstance;
        try {
            const history = await AIInterviewQuestionsRepository.getSessionHistory(sessionId);
            if (history.length === 0)
                return;
            console.log(`[AIInterviewTimeoutWorker] Processing timeout for session "${sessionId}"`);
            await AIInterviewQuestionsRepository.markSessionExpired(sessionId);
            try {
                await AIInterviewFinalEvaluationService.generateFinalEvaluation(sessionId);
            }
            catch (error) {
                console.error(`[AIInterviewTimeoutWorker] Final evaluation generation failed for session "${sessionId}":`, error.message);
            }
            if (targetIo && typeof targetIo.to === "function") {
                targetIo.to(sessionId).emit("ai-interview-timeout", {
                    sessionId,
                    completed: true,
                    reason: "TIME_LIMIT_REACHED"
                });
            }
        }
        catch (error) {
            console.error(`[AIInterviewTimeoutWorker] Error processing timeout for session "${sessionId}":`, error.message);
        }
    }
    static async checkAndExpireSessions(io) {
        try {
            const expiredSessions = await AIInterviewQuestionsRepository.findExpiredSessions();
            for (const session of expiredSessions) {
                await this.processSessionTimeout(session.id, io);
            }
        }
        catch (error) {
            console.error("[AIInterviewTimeoutWorker] Error checking expired sessions in DB scan:", error.message);
        }
    }
    /**
     * Runs a DB expiry scan and registers its promise in activeScans so that
     * stopWorker() can await it. The promise removes itself from the Set when
     * it settles (whether it resolves or throws).
     */
    static runTrackedScan(io) {
        const scan = this.checkAndExpireSessions(io).finally(() => {
            this.activeScans.delete(scan);
        });
        this.activeScans.add(scan);
    }
    static startWorker(io, intervalMs = 30000) {
        this.socketIoInstance = io;
        if (!this.worker) {
            try {
                this.worker = new Worker("ai-interview-timeout", async (job) => {
                    const { sessionId } = job.data;
                    if (sessionId) {
                        await this.processSessionTimeout(sessionId, this.socketIoInstance || undefined);
                    }
                }, { connection: redisConnectionConfig });
                this.worker.on("failed", (job, err) => {
                    console.error(`[AIInterviewTimeoutWorker] BullMQ timeout job "${job?.id}" failed:`, err.message);
                });
            }
            catch (err) {
                console.warn(`[AIInterviewTimeoutWorker] BullMQ worker initialization warning: ${err.message}`);
            }
        }
        if (!this.intervalTimer) {
            console.log(`[AIInterviewTimeoutWorker] Background expiration worker started (BullMQ + DB scan interval: ${intervalMs}ms)`);
            // Initial immediate scan — tracked so stopWorker() can await it.
            this.runTrackedScan(io);
            this.intervalTimer = setInterval(() => {
                // Each periodic scan is also tracked.
                this.runTrackedScan(io);
            }, intervalMs);
        }
    }
    static async stopWorker() {
        // Stop the interval so no new scans are dispatched.
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
        // Wait for every in-flight DB scan to finish before tearing down
        // connections. This prevents post-teardown Prisma/Socket errors.
        if (this.activeScans.size > 0) {
            await Promise.allSettled([...this.activeScans]);
            this.activeScans.clear();
        }
        // Close the BullMQ worker (waits for in-flight BullMQ jobs internally).
        if (this.worker) {
            try {
                await this.worker.close();
            }
            catch (err) {
                console.warn(`[AIInterviewTimeoutWorker] Error closing BullMQ worker: ${err?.message}`);
            }
            this.worker = null;
        }
        // Close the queue connection.
        if (timeoutQueueInstance) {
            try {
                await timeoutQueueInstance.close();
            }
            catch (err) {
                console.warn(`[AIInterviewTimeoutWorker] Error closing timeout queue: ${err?.message}`);
            }
            timeoutQueueInstance = null;
        }
        this.socketIoInstance = null;
    }
}
//# sourceMappingURL=ai.timeout.service.js.map