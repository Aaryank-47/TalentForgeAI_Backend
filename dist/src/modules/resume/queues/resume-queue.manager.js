import { logger } from "../../../common/logger/logger.js";
import { closeResumeProcessingQueue, getResumeProcessingQueue } from "./resume-processing.queue.js";
import { getResumeProcessingWorker, ResumeProcessingWorker } from "./resume-processing.worker.js";
// Initializes the resume processing background worker.
export function initResumeProcessingWorker() {
    logger.info("[ResumeQueueManager] Initializing Resume Queue and Worker...");
    getResumeProcessingQueue();
    const worker = getResumeProcessingWorker();
    worker.start();
    return worker;
}
// Gracefully shuts down the resume processing worker and queue connections.
export async function shutdownResumeProcessing() {
    logger.info("[ResumeQueueManager] Shutting down resume processing subsystem...");
    try {
        const worker = getResumeProcessingWorker();
        await worker.close();
    }
    catch (error) {
        logger.error({ err: error }, "[ResumeQueueManager] Error while closing worker");
    }
    try {
        await closeResumeProcessingQueue();
    }
    catch (error) {
        logger.error({ err: error }, "[ResumeQueueManager] Error while closing queue");
    }
    logger.info("[ResumeQueueManager] Resume processing subsystem shutdown complete.");
}
//# sourceMappingURL=resume-queue.manager.js.map