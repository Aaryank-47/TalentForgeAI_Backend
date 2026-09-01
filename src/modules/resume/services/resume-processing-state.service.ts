import { Redis } from "ioredis";
import { logger } from "../../../common/logger/logger.js";
import { createRedisConnection } from "../../../common/queue/redis.config.js";
import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";
import { STAGE_DISPLAY_MESSAGES } from "../websocket/resume-socket.constants.js";
import { STAGE_PROGRESS_PERCENTAGES, PROCESSING_STATE_TTL_SECONDS } from "../constants/resume.constants.js";
import type { ResumeProcessingProgressState } from "../interfaces/resume-pipeline.interface.js";

export class ResumeProcessingStateService {
    private static redisClient: Redis | null = null;

    private static getClient(): Redis {
        if (!this.redisClient) {
            this.redisClient = createRedisConnection();
            this.redisClient.on("error", (err) => {
                logger.warn({ err }, "[ResumeProcessingStateService] Redis connection error");
            });
        }
        return this.redisClient;
    }

    private static getKey(resumeId: string): string {
        return `resume:processing:${resumeId}`;
    }

    public static async setCurrentStage(
        resumeId: string,
        stage: ResumeProcessingStage,
        customMessage?: string
    ): Promise<void> {
        try {
            const client = this.getClient();
            const key = this.getKey(resumeId);

            const state: ResumeProcessingProgressState = {
                resumeId,
                status: stage === "COMPLETED" ? "COMPLETED" : stage === "FAILED" ? "FAILED" : "PROCESSING",
                stage,
                progress: STAGE_PROGRESS_PERCENTAGES[stage] ?? 50,
                message: customMessage || STAGE_DISPLAY_MESSAGES[stage] || `Processing stage: ${stage}`,
                updatedAt: new Date().toISOString()
            };

            await client.set(key, JSON.stringify(state), "EX", PROCESSING_STATE_TTL_SECONDS);
        } catch (error: unknown) {
            logger.warn(
                { err: error, resumeId, stage },
                "[ResumeProcessingStateService] Failed to set processing stage in Redis"
            );
        }
    }

    public static async getCurrentStage(
        resumeId: string
    ): Promise<ResumeProcessingProgressState | null> {
        try {
            const client = this.getClient();
            const key = this.getKey(resumeId);
            const raw = await client.get(key);

            if (!raw) return null;

            return JSON.parse(raw) as ResumeProcessingProgressState;
        } catch (error: unknown) {
            logger.warn(
                { err: error, resumeId },
                "[ResumeProcessingStateService] Failed to get processing stage from Redis"
            );
            return null;
        }
    }

    public static async clearCurrentStage(resumeId: string): Promise<void> {
        try {
            const client = this.getClient();
            const key = this.getKey(resumeId);
            await client.del(key);
        } catch (error: unknown) {
            logger.warn(
                { err: error, resumeId },
                "[ResumeProcessingStateService] Failed to clear processing stage from Redis"
            );
        }
    }

    public static async markFailed(
        resumeId: string,
        errorMessage?: string
    ): Promise<void> {
        try {
            const client = this.getClient();
            const key = this.getKey(resumeId);

            const state: ResumeProcessingProgressState = {
                resumeId,
                status: "FAILED",
                stage: "FAILED",
                progress: 100,
                message: errorMessage || "Resume processing failed",
                updatedAt: new Date().toISOString()
            };

            // Retain failed state for a short TTL (10 minutes) for UI recovery before expiry
            await client.set(key, JSON.stringify(state), "EX", 600);
        } catch (error: unknown) {
            logger.warn(
                { err: error, resumeId },
                "[ResumeProcessingStateService] Failed to record failure state in Redis"
            );
        }
    }
    public static async closeConnection(): Promise<void> {
        if (this.redisClient) {
            await this.redisClient.quit();
            this.redisClient = null;
        }
    }
}
