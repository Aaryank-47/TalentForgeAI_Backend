import { logger } from "../../../common/logger/logger.js";
import { MatchingElasticsearchService } from "./matching-elasticsearch.service.js";
import { MatchingRepository } from "../repositories/matching.repository.js";
import { MATCHING_THRESHOLDS } from "../constants/matching.constants.js";
export class MatchingRetrievalService {
    /**
     * Retrieve a targeted candidate subset for a given job.
     * Tries Elasticsearch first, then falls back to SQL query if ES yields 0 hits, is unreachable, or IDs do not exist in DB.
     */
    static async retrieveCandidatesForJob(job, limit = MATCHING_THRESHOLDS.MAX_CANDIDATES_RETRIEVAL_LIMIT) {
        let candidateIds = [];
        // 1. Try Elasticsearch retrieval
        try {
            candidateIds = await MatchingElasticsearchService.findCandidateIdsForJob(job, limit);
        }
        catch (err) {
            logger.warn({ err, jobId: job.id }, "[MatchingRetrieval] ES candidate search failed; trying SQL fallback");
        }
        // 2. Hydrate from PostgreSQL
        let candidates = [];
        if (candidateIds.length > 0) {
            candidates = await MatchingRepository.getCandidateProfilesByIds(candidateIds);
        }
        // 3. Fallback to SQL if ES yielded no valid candidates in DB
        if (candidates.length === 0) {
            const sqlCandidateIds = await MatchingRepository.findCandidateIdsForJobSql(job, limit);
            if (sqlCandidateIds.length > 0) {
                candidates = await MatchingRepository.getCandidateProfilesByIds(sqlCandidateIds);
            }
        }
        return candidates;
    }
    /**
     * Retrieve a targeted job subset for a given candidate.
     * Tries Elasticsearch first, then falls back to SQL query if ES yields 0 hits, is unreachable, or IDs do not exist in DB.
     */
    static async retrieveJobsForCandidate(candidate, limit = MATCHING_THRESHOLDS.MAX_JOBS_RETRIEVAL_LIMIT) {
        let jobIds = [];
        // 1. Try Elasticsearch retrieval
        try {
            jobIds = await MatchingElasticsearchService.findJobIdsForCandidate(candidate, limit);
        }
        catch (err) {
            logger.warn({ err, candidateId: candidate.id }, "[MatchingRetrieval] ES job search failed; trying SQL fallback");
        }
        // 2. Hydrate from PostgreSQL
        let jobs = [];
        if (jobIds.length > 0) {
            jobs = await MatchingRepository.getJobRequirementsByIds(jobIds);
        }
        // 3. Fallback to SQL if ES yielded no valid jobs in DB
        if (jobs.length === 0) {
            const sqlJobIds = await MatchingRepository.findJobIdsForCandidateSql(candidate, limit);
            if (sqlJobIds.length > 0) {
                jobs = await MatchingRepository.getJobRequirementsByIds(sqlJobIds);
            }
        }
        return jobs;
    }
}
//# sourceMappingURL=matching-retrieval.service.js.map