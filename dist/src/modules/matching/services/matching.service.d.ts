import type { MatchCalculationResult, MatchingMetrics, CandidateMatchedJobView, RecruiterMatchedCandidateView } from "../interfaces/matching.interface.js";
export declare class MatchingService {
    static matchForJob(jobId: string): Promise<MatchingMetrics>;
    /**
     * Executes targeted matching for a single Candidate against relevant jobs.
     */
    static matchForCandidate(candidateId: string): Promise<MatchingMetrics>;
    /**
     * Targeted recalculation of a single candidate-job pair.
     */
    static recalculatePair(candidateId: string, jobId: string): Promise<MatchCalculationResult>;
    /**
     * Candidate-side query: reads persisted matched jobs for candidate.
     */
    static getMatchedJobsForCandidate(userId: string, options?: {
        page?: number;
        limit?: number;
        minScore?: number;
    }): Promise<{
        matches: CandidateMatchedJobView[];
        total: number;
    }>;
    /**
     * Recruiter-side query: reads persisted matched candidates for a specific job.
     */
    static getMatchedCandidatesForJob(jobId: string, userId: string, companyId?: string, options?: {
        page?: number;
        limit?: number;
        minScore?: number;
    }): Promise<{
        matches: RecruiterMatchedCandidateView[];
        total: number;
    }>;
}
//# sourceMappingURL=matching.service.d.ts.map