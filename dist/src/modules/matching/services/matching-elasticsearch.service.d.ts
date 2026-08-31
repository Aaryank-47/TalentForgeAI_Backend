import type { CandidateMatchingProfile, JobMatchingRequirements } from "../interfaces/matching.interface.js";
export declare class MatchingElasticsearchService {
    static ensureIndices(): Promise<void>;
    /**
     * Index or update a candidate in Elasticsearch
     */
    static indexCandidate(candidate: CandidateMatchingProfile): Promise<void>;
    /**
     * Index or update a job in Elasticsearch
     */
    static indexJob(job: JobMatchingRequirements): Promise<void>;
    /**
     * Query potentially matching candidate IDs for a given job requirements payload.
     * Narrow down candidates using skill overlap, experience ranges, and open-to-work flags.
     */
    static findCandidateIdsForJob(job: JobMatchingRequirements, limit?: 150): Promise<string[]>;
    /**
     * Query potentially matching job IDs for a given candidate profile.
     */
    static findJobIdsForCandidate(candidate: CandidateMatchingProfile, limit?: 100): Promise<string[]>;
}
//# sourceMappingURL=matching-elasticsearch.service.d.ts.map