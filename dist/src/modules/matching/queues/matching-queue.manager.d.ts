import { MatchingWorker } from "./matching.worker.js";
/**
 * Initializes matching queue and worker at server startup.
 */
export declare function initMatchingWorker(): MatchingWorker;
/**
 * Gracefully shuts down matching queue and worker during server shutdown.
 */
export declare function shutdownMatchingSubsystem(): Promise<void>;
//# sourceMappingURL=matching-queue.manager.d.ts.map