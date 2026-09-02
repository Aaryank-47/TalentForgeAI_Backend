import { Redis } from "ioredis";
import { logger } from "../../../common/logger/logger.js";
import { createRedisConnection } from "../../../common/queue/redis.config.js";
import { STAGE_DISPLAY_MESSAGES } from "../websocket/resume-socket.constants.js";
import { STAGE_PROGRESS_PERCENTAGES, PROCESSING_STATE_TTL_SECONDS } from "../constants/resume.constants.js";
export class ResumeProcessingStateService {
    static redisClient = null;
    static getClient() {
        if (!this.redisClient) {
            this.redisClient = createRedisConnection();
            this.redisClient.on("error", (err) => {
                logger.warn({ err }, "[ResumeProcessingStateService] Redis connection error");
            });
        }
        return this.redisClient;
    }
    static getKey(resumeId) {
        return `resume:processing:${resumeId}`;
    }
    static async setCurrentStage(resumeId, stage, customMessage) {
        try {
            const client = this.getClient();
            const key = this.getKey(resumeId);
            const state = {
                resumeId,
                status: stage === "COMPLETED" ? "COMPLETED" : stage === "FAILED" ? "FAILED" : "PROCESSING",
                stage,
                progress: STAGE_PROGRESS_PERCENTAGES[stage] ?? 50,
                message: customMessage || STAGE_DISPLAY_MESSAGES[stage] || `Processing stage: ${stage}`,
                updatedAt: new Date().toISOString()
            };
            await client.set(key, JSON.stringify(state), "EX", PROCESSING_STATE_TTL_SECONDS);
        }
        catch (error) {
            logger.warn({ err: error, resumeId, stage }, "[ResumeProcessingStateService] Failed to set processing stage in Redis");
        }
    }
    static async getCurrentStage(resumeId) {
        try {
            const client = this.getClient();
            const key = this.getKey(resumeId);
            const raw = await client.get(key);
            if (!raw)
                return null;
            return JSON.parse(raw);
        }
        catch (error) {
            logger.warn({ err: error, resumeId }, "[ResumeProcessingStateService] Failed to get processing stage from Redis");
            return null;
        }
    }
    static async clearCurrentStage(resumeId) {
        try {
            const client = this.getClient();
            const key = this.getKey(resumeId);
            await client.del(key);
        }
        catch (error) {
            logger.warn({ err: error, resumeId }, "[ResumeProcessingStateService] Failed to clear processing stage from Redis");
        }
    }
    static async markFailed(resumeId, errorMessage) {
        try {
            const client = this.getClient();
            const key = this.getKey(resumeId);
            const state = {
                resumeId,
                status: "FAILED",
                stage: "FAILED",
                progress: 100,
                message: errorMessage || "Resume processing failed",
                updatedAt: new Date().toISOString()
            };
            // Retain failed state for a short TTL (10 minutes) for UI recovery before expiry
            await client.set(key, JSON.stringify(state), "EX", 600);
        }
        catch (error) {
            logger.warn({ err: error, resumeId }, "[ResumeProcessingStateService] Failed to record failure state in Redis");
        }
    }
    static async closeConnection() {
        if (this.redisClient) {
            await this.redisClient.quit();
            this.redisClient = null;
        }
    }
}
//# sourceMappingURL=resume-processing-state.service.js.map