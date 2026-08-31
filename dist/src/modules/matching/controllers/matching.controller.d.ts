import type { Request, Response } from "express";
export declare class MatchingController {
    /**
     * Candidate-side: Get AI-matched jobs for current candidate.
     */
    static getMatchedJobs(req: Request, res: Response): Promise<void>;
    /**
     * Candidate-side: On-demand trigger to recalculate matching jobs.
     */
    static recalculateCandidateMatches(req: Request, res: Response): Promise<void>;
    /**
     * Recruiter-side: Get matched candidates for a specific job.
     */
    static getMatchedCandidates(req: Request, res: Response): Promise<void>;
    /**
     * Recruiter-side: On-demand trigger to recalculate candidates for a job.
     */
    static recalculateJobMatches(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=matching.controller.d.ts.map