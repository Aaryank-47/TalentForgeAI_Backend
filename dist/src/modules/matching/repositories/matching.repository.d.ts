import type { CandidateMatchingProfile, JobMatchingRequirements, MatchCalculationResult, CandidateMatchedJobView, RecruiterMatchedCandidateView } from "../interfaces/matching.interface.js";
export declare class MatchingRepository {
    static getCandidateMatchingProfile(candidateId: string): Promise<CandidateMatchingProfile | null>;
    /**
     * Retrieves full job matching requirements including required and preferred skills.
     */
    static getJobMatchingRequirements(jobId: string): Promise<JobMatchingRequirements | null>;
    static incrementCandidateProfileVersion(candidateId: string): Promise<number>;
    static incrementJobRequirementsVersion(jobId: string): Promise<number>;
    static getCandidateProfilesByIds(candidateIds: string[]): Promise<CandidateMatchingProfile[]>;
    static getJobRequirementsByIds(jobIds: string[]): Promise<JobMatchingRequirements[]>;
    /**
     * Targeted SQL fallback query for candidates matching a job.
     */
    static findCandidateIdsForJobSql(job: JobMatchingRequirements, limit?: 150): Promise<string[]>;
    /**
     * Targeted SQL fallback query for jobs matching a candidate.
     */
    static findJobIdsForCandidateSql(candidate: CandidateMatchingProfile, limit?: 100): Promise<string[]>;
    /**
     * Idempotently upsert a CandidateJobMatch record.
     */
    static upsertMatch(result: MatchCalculationResult): Promise<void>;
    /**
     * Marks existing matches as STALE for a candidate when their profile changes.
     */
    static markMatchesStaleForCandidate(candidateId: string): Promise<void>;
    /**
     * Marks existing matches as STALE for a job when its requirements change.
     */
    static markMatchesStaleForJob(jobId: string): Promise<void>;
    /**
     * Candidate-side read: Returns persisted ranked matched jobs.
     */
    static findMatchesForCandidate(candidateId: string, options?: {
        page?: number;
        limit?: number;
        minScore?: number;
    }): Promise<{
        matches: CandidateMatchedJobView[];
        total: number;
    }>;
    /**
     * Recruiter-side read: Returns persisted ranked matched candidates for a specific job.
     */
    static findMatchesForJob(jobId: string, options?: {
        page?: number;
        limit?: number;
        minScore?: number;
    }): Promise<{
        matches: RecruiterMatchedCandidateView[];
        total: number;
    }>;
}
//# sourceMappingURL=matching.repository.d.ts.map