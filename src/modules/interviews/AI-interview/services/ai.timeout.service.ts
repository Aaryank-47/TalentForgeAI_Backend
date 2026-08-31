import type { Server } from "socket.io";
import { Queue, Worker } from "bullmq";
import { redisConnectionConfig } from "../../../../common/queue/redis.config.js";
import { AIInterviewQuestionsRepository } from "../repositories/ai.interview.repository.js";
import { AIInterviewFinalEvaluationService } from "./ai.final.evaluation.service.js";

export const interviewTimeoutQueue = new Queue("ai-interview-timeout", {
    connection: redisConnectionConfig
});

export class AIInterviewTimeoutWorker {
    private static intervalTimer: NodeJS.Timeout | null = null;
    private static worker: Worker | null = null;
    private static socketIoInstance: Server | null = null;

    static async scheduleTimeoutJob(sessionId: string, durationMinutes: number) {
        const delayMs = durationMinutes * 60 * 1000;
        try {
            await interviewTimeoutQueue.add(
                "expire-session",
                { sessionId },
                {
                    jobId: `timeout-${sessionId}`,
                    delay: Math.max(0, delayMs),
                    removeOnComplete: true,
                    removeOnFail: false
                }
            );
            console.log(`[AIInterviewTimeoutWorker] Scheduled BullMQ timeout job for session "${sessionId}" in ${durationMinutes} mins.`);
        } catch (error: any) {
            console.warn(`[AIInterviewTimeoutWorker] Could not schedule BullMQ job (Redis offline?): ${error.message}. DB request guard will handle expiration.`);
        }
    }

    static async processSessionTimeout(sessionId: string, io?: Server) {
        const targetIo = io || this.socketIoInstance;
        try {
            const history = await AIInterviewQuestionsRepository.getSessionHistory(sessionId);
            if (history.length === 0) return;

            console.log(`[AIInterviewTimeoutWorker] Processing timeout for session "${sessionId}"`);

            await AIInterviewQuestionsRepository.markSessionExpired(sessionId);

            try {
                await AIInterviewFinalEvaluationService.generateFinalEvaluation(sessionId);
            } catch (error: any) {
                console.error(`[AIInterviewTimeoutWorker] Final evaluation generation failed for session "${sessionId}":`, error.message);
            }

            if (targetIo) {
                targetIo.to(sessionId).emit("ai-interview-timeout", {
                    sessionId,
                    completed: true,
                    reason: "TIME_LIMIT_REACHED"
                });
            }
        } catch (error: any) {
            console.error(`[AIInterviewTimeoutWorker] Error processing timeout for session "${sessionId}":`, error.message);
        }
    }

    static async checkAndExpireSessions(io?: Server) {
        try {
            const expiredSessions = await AIInterviewQuestionsRepository.findExpiredSessions();

            for (const session of expiredSessions) {
                await this.processSessionTimeout(session.id, io);
            }
        } catch (error: any) {
            console.error("[AIInterviewTimeoutWorker] Error checking expired sessions in DB scan:", error.message);
        }
    }

    static startWorker(io: Server, intervalMs = 30000) {
        this.socketIoInstance = io;

        if (!this.worker) {
            try {
                this.worker = new Worker(
                    "ai-interview-timeout",
                    async job => {
                        const { sessionId } = job.data;
                        if (sessionId) {
                            await this.processSessionTimeout(sessionId, this.socketIoInstance || undefined);
                        }
                    },
                    { connection: redisConnectionConfig }
                );

                this.worker.on("failed", (job, err) => {
                    console.error(`[AIInterviewTimeoutWorker] BullMQ timeout job "${job?.id}" failed:`, err.message);
                });
            } catch (err: any) {
                console.warn(`[AIInterviewTimeoutWorker] BullMQ worker initialization warning: ${err.message}`);
            }
        }

        if (!this.intervalTimer) {
            console.log(`[AIInterviewTimeoutWorker] Background expiration worker started (BullMQ + DB scan interval: ${intervalMs}ms)`);
            this.checkAndExpireSessions(io);
            this.intervalTimer = setInterval(() => {
                this.checkAndExpireSessions(io);
            }, intervalMs);
        }
    }

    static stopWorker() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
        if (this.worker) {
            this.worker.close();
            this.worker = null;
        }
    }
}
