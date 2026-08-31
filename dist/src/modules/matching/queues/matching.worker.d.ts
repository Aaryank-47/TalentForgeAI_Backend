import { Worker, type Job } from "bullmq";
import type { MatchingJobData, MatchingMetrics } from "../interfaces/matching.interface.js";
export declare class MatchingWorker {
    private worker;
    start(): Worker<MatchingJobData, MatchingMetrics | any>;
    processJob(job: Job<MatchingJobData, MatchingMetrics | any>): Promise<any>;
    private attachEventListeners;
    close(): Promise<void>;
}
export declare function getMatchingWorker(): MatchingWorker;
//# sourceMappingURL=matching.worker.d.ts.map