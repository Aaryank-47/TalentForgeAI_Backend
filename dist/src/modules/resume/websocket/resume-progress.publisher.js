import { logger } from "../../../common/logger/logger.js";
import { getResumeRoomName, RESUME_SOCKET_EVENTS, STAGE_DISPLAY_MESSAGES } from "./resume-socket.constants.js";
/**
 * Targeted sanitization of internal errors, tokens, and infrastructure messages before broadcasting to client.
 */
function sanitizeReason(rawReason) {
    if (!rawReason)
        return undefined;
    const lower = rawReason.toLowerCase();
    if (lower.includes("api_key") ||
        lower.includes("openrouter") ||
        lower.includes("authorization") ||
        lower.includes("bearer") ||
        lower.includes("prisma") ||
        lower.includes("database") ||
        lower.includes("sql") ||
        lower.includes("connection string") ||
        lower.includes("secret") ||
        lower.includes("password") ||
        lower.includes("postgres") ||
        lower.includes("redis")) {
        return "Optimized document processing mode activated";
    }
    if (rawReason.length > 200) {
        return rawReason.slice(0, 197) + "...";
    }
    return rawReason;
}
/**
 * Publisher responsible for emitting sanitized real-time resume processing progress over Socket.IO.
 * Decouples ResumeProcessingPipeline and ResumeProcessingWorker from Socket.IO specifics.
 */
export class ResumeProgressPublisher {
    static namespaceInstance = null;
    // Attaches the Socket.IO namespace to the publisher.
    static setNamespace(namespace) {
        this.namespaceInstance = namespace;
    }
    // Gets the currently registered namespace instance.
    static getNamespace() {
        return this.namespaceInstance;
    }
    /**
     * Emits a stage change event (FETCHING_FILE, EXTRACTION, AI_PARSING, NORMALIZATION, PERSISTENCE) to the resume room.
     * Note: NEVER throws; catches all transport errors to ensure pipeline continuity.
     */
    static async publishStageChange(stage, meta) {
        try {
            const { resumeId, jobId, candidateId, mode, reason } = meta;
            const roomName = getResumeRoomName(resumeId);
            const sanitizedUserReason = sanitizeReason(reason);
            const message = STAGE_DISPLAY_MESSAGES[stage] || `Processing stage: ${stage}`;
            const timestamp = new Date().toISOString();
            logger.info({
                event: "RESUME_STAGE_PUBLISHED",
                roomName,
                resumeId,
                jobId,
                candidateId,
                stage,
                mode,
                hasNamespace: !!this.namespaceInstance
            }, `[ResumeProgressPublisher] Publishing stage "${stage}" for resume "${resumeId}"`);
            if (!this.namespaceInstance) {
                logger.debug({ resumeId, stage }, "[ResumeProgressPublisher] Socket namespace not initialized; skipping live broadcast");
                return;
            }
            const stagePayload = {
                resumeId,
                jobId,
                candidateId,
                stage,
                mode,
                reason: sanitizedUserReason,
                message,
                timestamp
            };
            this.namespaceInstance.to(roomName).emit(RESUME_SOCKET_EVENTS.STAGE_CHANGE, stagePayload);
        }
        catch (error) {
            logger.warn({
                err: error instanceof Error ? error.message : error,
                event: "RESUME_PROGRESS_PUBLISH_FAILED",
                resumeId: meta.resumeId,
                stage
            }, "[ResumeProgressPublisher] Failed to emit stage change event to socket");
        }
    }
    /**
     * Emits the COMPLETED event to the resume room.
     * CRITICAL INVARIANT: This must ONLY be invoked after PostgreSQL has successfully recorded parsingStatus = COMPLETED.
     * Note: NEVER throws.
     */
    static async publishCompleted(meta) {
        try {
            const { resumeId, jobId, candidateId } = meta;
            const roomName = getResumeRoomName(resumeId);
            const timestamp = new Date().toISOString();
            logger.info({
                event: "RESUME_COMPLETED_PUBLISHED",
                roomName,
                resumeId,
                jobId,
                candidateId
            }, `[ResumeProgressPublisher] Publishing COMPLETED event for resume "${resumeId}"`);
            if (!this.namespaceInstance) {
                logger.debug({ resumeId }, "[ResumeProgressPublisher] Socket namespace not initialized; skipping COMPLETED broadcast");
                return;
            }
            const completedPayload = {
                resumeId,
                jobId,
                candidateId,
                stage: "COMPLETED",
                message: STAGE_DISPLAY_MESSAGES.COMPLETED,
                timestamp
            };
            this.namespaceInstance.to(roomName).emit(RESUME_SOCKET_EVENTS.COMPLETED, completedPayload);
        }
        catch (error) {
            logger.warn({
                err: error instanceof Error ? error.message : error,
                event: "RESUME_PROGRESS_PUBLISH_FAILED",
                resumeId: meta.resumeId,
                stage: "COMPLETED"
            }, "[ResumeProgressPublisher] Failed to emit completed event to socket");
        }
    }
    /**
     * Emits a final failure event when resume processing has permanently failed or exhausted retries.
     * Note: NEVER throws.
     */
    static async publishFinalFailure(meta, errorMessage) {
        try {
            const { resumeId, jobId, candidateId } = meta;
            const roomName = getResumeRoomName(resumeId);
            const sanitizedError = sanitizeReason(errorMessage) || "Resume processing encountered a failure";
            const timestamp = new Date().toISOString();
            logger.error({
                event: "RESUME_FAILED_PUBLISHED",
                roomName,
                resumeId,
                jobId,
                candidateId,
                error: sanitizedError
            }, `[ResumeProgressPublisher] Publishing final failure event for resume "${resumeId}"`);
            if (!this.namespaceInstance) {
                return;
            }
            const failedPayload = {
                resumeId,
                jobId,
                candidateId,
                stage: "FAILED",
                error: sanitizedError,
                message: STAGE_DISPLAY_MESSAGES.FAILED,
                timestamp
            };
            this.namespaceInstance.to(roomName).emit(RESUME_SOCKET_EVENTS.FAILED, failedPayload);
        }
        catch (error) {
            logger.warn({
                err: error instanceof Error ? error.message : error,
                event: "RESUME_PROGRESS_PUBLISH_FAILED",
                resumeId: meta.resumeId
            }, "[ResumeProgressPublisher] Failed to emit final failure event to socket");
        }
    }
}
//# sourceMappingURL=resume-progress.publisher.js.map