import type { CandidateMatchingProfile, JobMatchingRequirements } from "../interfaces/matching.interface.js";
export declare class MatchingRetrievalService {
    /**
     * Retrieve a targeted candidate subset for a given job.
     * Tries Elasticsearch first, then falls back to SQL query if ES yields 0 hits, is unreachable, or IDs do not exist in DB.
     */
    static retrieveCandidatesForJob(job: JobMatchingRequirements, limit?: 150): Promise<CandidateMatchingProfile[]>;
    /**
     * Retrieve a targeted job subset for a given candidate.
     * Tries Elasticsearch first, then falls back to SQL query if ES yields 0 hits, is unreachable, or IDs do not exist in DB.
     */
    static retrieveJobsForCandidate(candidate: CandidateMatchingProfile, limit?: 100): Promise<JobMatchingRequirements[]>;
}
//# sourceMappingURL=matching-retrieval.service.d.ts.map