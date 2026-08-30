import { logger } from "../../../common/logger/logger.js";
import { getMatchingQueue, closeMatchingQueue } from "./matching.queue.js";
import { getMatchingWorker, MatchingWorker } from "./matching.worker.js";

/**
 * Initializes matching queue and worker at server startup.
 */
export function initMatchingWorker(): MatchingWorker {
    logger.info("[MatchingQueueManager] Initializing Matching Queue and Worker...");

    getMatchingQueue();
    const worker = getMatchingWorker();
    worker.start();

    return worker;
}

/**
 * Gracefully shuts down matching queue and worker during server shutdown.
 */
export async function shutdownMatchingSubsystem(): Promise<void> {
    logger.info("[MatchingQueueManager] Shutting down matching subsystem...");

    try {
        const worker = getMatchingWorker();
        await worker.close();
    } catch (error) {
        logger.error({ err: error }, "[MatchingQueueManager] Error closing matching worker");
    }

    try {
        await closeMatchingQueue();
    } catch (error) {
        logger.error({ err: error }, "[MatchingQueueManager] Error closing matching queue");
    }

    logger.info("[MatchingQueueManager] Matching subsystem shutdown complete.");
}
