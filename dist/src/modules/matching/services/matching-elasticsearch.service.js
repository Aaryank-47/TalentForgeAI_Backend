import elasticsearchClient from "../../../config/elasticsearch.js";
import { logger } from "../../../common/logger/logger.js";
import { ES_MATCHING_INDICES, ES_CANDIDATE_MAPPINGS, ES_JOB_MAPPINGS, MATCHING_THRESHOLDS } from "../constants/matching.constants.js";
export class MatchingElasticsearchService {
    static async ensureIndices() {
        try {
            // Candidate Index
            const candExists = await elasticsearchClient.indices.exists({
                index: ES_MATCHING_INDICES.CANDIDATES
            });
            if (!candExists) {
                await elasticsearchClient.indices.create({
                    index: ES_MATCHING_INDICES.CANDIDATES,
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1
                    },
                    mappings: ES_CANDIDATE_MAPPINGS
                });
                logger.info(`[MatchingES] Index "${ES_MATCHING_INDICES.CANDIDATES}" created successfully.`);
            }
            // Job Index
            const jobExists = await elasticsearchClient.indices.exists({
                index: ES_MATCHING_INDICES.JOBS
            });
            if (!jobExists) {
                await elasticsearchClient.indices.create({
                    index: ES_MATCHING_INDICES.JOBS,
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1
                    },
                    mappings: ES_JOB_MAPPINGS
                });
                logger.info(`[MatchingES] Index "${ES_MATCHING_INDICES.JOBS}" created successfully.`);
            }
        }
        catch (error) {
            logger.warn({ err: error }, "[MatchingES] Could not ensure matching ES indices. Will fallback to SQL filtering.");
        }
    }
    /**
     * Index or update a candidate in Elasticsearch
     */
    static async indexCandidate(candidate) {
        try {
            const skillNames = candidate.skills.map((s) => s.name);
            await elasticsearchClient.index({
                index: ES_MATCHING_INDICES.CANDIDATES,
                id: candidate.id,
                document: {
                    id: candidate.id,
                    userId: candidate.userId,
                    fullName: candidate.fullName,
                    headline: candidate.headline,
                    currentDesignation: candidate.currentDesignation,
                    totalExperience: candidate.totalExperience,
                    experienceLevel: candidate.experienceLevel,
                    currentLocation: candidate.currentLocation,
                    preferredLocation: candidate.preferredLocation,
                    isOpenToWork: candidate.isOpenToWork,
                    skills: skillNames,
                    skillText: skillNames.join(" "),
                    educationDegrees: candidate.educationDegrees.join(" "),
                    certifications: candidate.certificationNames.join(" "),
                    profileVersion: candidate.profileVersion,
                    updatedAt: candidate.updatedAt
                }
            });
        }
        catch (error) {
            logger.warn({ err: error, candidateId: candidate.id }, "[MatchingES] Failed to index candidate into ES.");
        }
    }
    /**
     * Index or update a job in Elasticsearch
     */
    static async indexJob(job) {
        try {
            const skillNames = job.skills.map((s) => s.name);
            await elasticsearchClient.index({
                index: ES_MATCHING_INDICES.JOBS,
                id: job.id,
                document: {
                    id: job.id,
                    companyId: job.companyId,
                    title: job.title,
                    summary: job.summary,
                    description: job.description,
                    employmentType: job.employmentType,
                    workplaceType: job.workplaceType,
                    location: job.location,
                    minExperience: job.minExperience,
                    maxExperience: job.maxExperience,
                    status: job.status,
                    skills: skillNames,
                    skillText: skillNames.join(" "),
                    requirementsVersion: job.requirementsVersion,
                    updatedAt: job.updatedAt
                }
            });
        }
        catch (error) {
            logger.warn({ err: error, jobId: job.id }, "[MatchingES] Failed to index job into ES.");
        }
    }
    /**
     * Query potentially matching candidate IDs for a given job requirements payload.
     * Narrow down candidates using skill overlap, experience ranges, and open-to-work flags.
     */
    static async findCandidateIdsForJob(job, limit = MATCHING_THRESHOLDS.MAX_CANDIDATES_RETRIEVAL_LIMIT) {
        try {
            const skillKeywords = job.skills.map((s) => s.name);
            const shouldClauses = [];
            if (skillKeywords.length > 0) {
                shouldClauses.push({
                    terms: { skills: skillKeywords.map(s => s.toLowerCase()) }
                });
                shouldClauses.push({
                    match: { skillText: { query: skillKeywords.join(" "), boost: 2.0 } }
                });
            }
            if (job.title) {
                shouldClauses.push({
                    match: { currentDesignation: { query: job.title, boost: 1.5 } }
                });
                shouldClauses.push({
                    match: { headline: { query: job.title, boost: 1.2 } }
                });
            }
            if (job.location && job.workplaceType !== "REMOTE") {
                shouldClauses.push({
                    match: { currentLocation: { query: job.location, boost: 1.0 } }
                });
            }
            const mustClauses = [
                { term: { isOpenToWork: true } }
            ];
            const response = await elasticsearchClient.search({
                index: ES_MATCHING_INDICES.CANDIDATES,
                size: limit,
                query: {
                    bool: {
                        must: mustClauses,
                        should: shouldClauses.length > 0 ? shouldClauses : [{ match_all: {} }],
                        minimum_should_match: shouldClauses.length > 0 ? 1 : 0
                    }
                }
            });
            const hits = response.hits?.hits || [];
            return hits.map((hit) => hit._id || hit._source?.id).filter(Boolean);
        }
        catch (error) {
            logger.warn({ err: error, jobId: job.id }, "[MatchingES] ES candidate search failed; returning empty for SQL fallback.");
            return [];
        }
    }
    /**
     * Query potentially matching job IDs for a given candidate profile.
     */
    static async findJobIdsForCandidate(candidate, limit = MATCHING_THRESHOLDS.MAX_JOBS_RETRIEVAL_LIMIT) {
        try {
            const skillKeywords = candidate.skills.map((s) => s.name);
            const shouldClauses = [];
            if (skillKeywords.length > 0) {
                shouldClauses.push({
                    terms: { skills: skillKeywords.map(s => s.toLowerCase()) }
                });
                shouldClauses.push({
                    match: { skillText: { query: skillKeywords.join(" "), boost: 2.0 } }
                });
            }
            if (candidate.currentDesignation || candidate.headline) {
                const roleQuery = `${candidate.currentDesignation || ""} ${candidate.headline || ""}`.trim();
                if (roleQuery) {
                    shouldClauses.push({
                        match: { title: { query: roleQuery, boost: 1.5 } }
                    });
                }
            }
            const mustClauses = [
                { term: { status: "PUBLISHED" } }
            ];
            const response = await elasticsearchClient.search({
                index: ES_MATCHING_INDICES.JOBS,
                size: limit,
                query: {
                    bool: {
                        must: mustClauses,
                        should: shouldClauses.length > 0 ? shouldClauses : [{ match_all: {} }],
                        minimum_should_match: shouldClauses.length > 0 ? 1 : 0
                    }
                }
            });
            const hits = response.hits?.hits || [];
            return hits.map((hit) => hit._id || hit._source?.id).filter(Boolean);
        }
        catch (error) {
            logger.warn({ err: error, candidateId: candidate.id }, "[MatchingES] ES job search failed; returning empty for SQL fallback.");
            return [];
        }
    }
}
//# sourceMappingURL=matching-elasticsearch.service.js.map