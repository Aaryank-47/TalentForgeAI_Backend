import { Queue, type JobsOptions, type Job } from "bullmq";
import type { MatchingJobData } from "../interfaces/matching.interface.js";
export declare function getMatchingQueue(): Queue<MatchingJobData>;
export declare class MatchingQueueService {
    /**
     * Enqueue matching job for a newly published or updated job.
     * Uses deterministic job ID to prevent duplicate concurrent executions for same version.
     */
    static addMatchForJobTask(jobId: string, jobVersion?: number, options?: Partial<JobsOptions>): Promise<Job<MatchingJobData>>;
    /**
     * Enqueue matching job for candidate profile/resume change.
     */
    static addMatchForCandidateTask(candidateId: string, candidateVersion?: number, options?: Partial<JobsOptions>): Promise<Job<MatchingJobData>>;
    /**
     * Enqueue pair recalculation task.
     */
    static addRecalculatePairTask(candidateId: string, jobId: string, options?: Partial<JobsOptions>): Promise<Job<MatchingJobData>>;
    static closeMatchingQueue(): Promise<void>;
}
export declare const addMatchForJobTask: typeof MatchingQueueService.addMatchForJobTask;
export declare const addMatchForCandidateTask: typeof MatchingQueueService.addMatchForCandidateTask;
export declare const addRecalculatePairTask: typeof MatchingQueueService.addRecalculatePairTask;
export declare const closeMatchingQueue: typeof MatchingQueueService.closeMatchingQueue;
//# sourceMappingURL=matching.queue.d.ts.map