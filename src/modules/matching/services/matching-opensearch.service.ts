import opensearchClient from "../../../config/opensearch.js";
import { logger } from "../../../common/logger/logger.js";
import {
    ES_MATCHING_INDICES,
    ES_CANDIDATE_MAPPINGS,
    ES_JOB_MAPPINGS,
    MATCHING_THRESHOLDS
} from "../constants/matching.constants.js";
import type {
    CandidateMatchingProfile,
    JobMatchingRequirements
} from "../interfaces/matching.interface.js";

export class MatchingOpensearchService {
    public static async ensureIndices(): Promise<void> {
        try {
            // Candidate Index
            const candExistsRes = await opensearchClient.indices.exists({
                index: ES_MATCHING_INDICES.CANDIDATES
            });
            const candExists = Boolean(candExistsRes.body ?? candExistsRes);

            if (!candExists) {
                await opensearchClient.indices.create({
                    index: ES_MATCHING_INDICES.CANDIDATES,
                    body: {
                        settings: {
                            number_of_shards: 1,
                            number_of_replicas: 1
                        },
                        mappings: ES_CANDIDATE_MAPPINGS
                    }
                });
                logger.info(`[MatchingOpenSearch] Index "${ES_MATCHING_INDICES.CANDIDATES}" created successfully.`);
            }

            // Job Index
            const jobExistsRes = await opensearchClient.indices.exists({
                index: ES_MATCHING_INDICES.JOBS
            });
            const jobExists = Boolean(jobExistsRes.body ?? jobExistsRes);

            if (!jobExists) {
                await opensearchClient.indices.create({
                    index: ES_MATCHING_INDICES.JOBS,
                    body: {
                        settings: {
                            number_of_shards: 1,
                            number_of_replicas: 1
                        },
                        mappings: ES_JOB_MAPPINGS
                    }
                });
                logger.info(`[MatchingOpenSearch] Index "${ES_MATCHING_INDICES.JOBS}" created successfully.`);
            }
        } catch (error) {
            logger.warn({ err: error }, "[MatchingOpenSearch] Could not ensure matching OpenSearch indices. Will fallback to SQL filtering.");
        }
    }

    /**
     * Index or update a candidate in OpenSearch
     */
    public static async indexCandidate(candidate: CandidateMatchingProfile): Promise<void> {
        try {
            const skillNames = candidate.skills.map((s) => s.name);
            await opensearchClient.index({
                index: ES_MATCHING_INDICES.CANDIDATES,
                id: candidate.id,
                body: {
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
                },
                refresh: true
            });
        } catch (error) {
            logger.warn({ err: error, candidateId: candidate.id }, "[MatchingOpenSearch] Failed to index candidate into OpenSearch.");
        }
    }

    /**
     * Index or update a job in OpenSearch
     */
    public static async indexJob(job: JobMatchingRequirements): Promise<void> {
        try {
            const skillNames = job.skills.map((s) => s.name);
            await opensearchClient.index({
                index: ES_MATCHING_INDICES.JOBS,
                id: job.id,
                body: {
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
                },
                refresh: true
            });
        } catch (error) {
            logger.warn({ err: error, jobId: job.id }, "[MatchingOpenSearch] Failed to index job into OpenSearch.");
        }
    }

    /**
     * Query potentially matching candidate IDs for a given job requirements payload.
     */
    public static async findCandidateIdsForJob(
        job: JobMatchingRequirements,
        limit = MATCHING_THRESHOLDS.MAX_CANDIDATES_RETRIEVAL_LIMIT
    ): Promise<string[]> {
        try {
            const skillKeywords = job.skills.map((s) => s.name);
            const shouldClauses: any[] = [];

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

            const mustClauses: any[] = [
                { term: { isOpenToWork: true } }
            ];

            const response = await opensearchClient.search({
                index: ES_MATCHING_INDICES.CANDIDATES,
                size: limit,
                body: {
                    query: {
                        bool: {
                            must: mustClauses,
                            should: shouldClauses.length > 0 ? shouldClauses : [{ match_all: {} }],
                            minimum_should_match: shouldClauses.length > 0 ? 1 : 0
                        }
                    }
                }
            });

            const searchBody: any = response.body ?? response;
            const hits = searchBody?.hits?.hits || [];
            return hits.map((hit: any) => hit._id || hit._source?.id).filter(Boolean);
        } catch (error) {
            logger.warn({ err: error, jobId: job.id }, "[MatchingOpenSearch] OpenSearch candidate search failed; returning empty for SQL fallback.");
            return [];
        }
    }

    /**
     * Query potentially matching job IDs for a given candidate profile.
     */
    public static async findJobIdsForCandidate(
        candidate: CandidateMatchingProfile,
        limit = MATCHING_THRESHOLDS.MAX_JOBS_RETRIEVAL_LIMIT
    ): Promise<string[]> {
        try {
            const skillKeywords = candidate.skills.map((s) => s.name);
            const shouldClauses: any[] = [];

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

            const mustClauses: any[] = [
                { term: { status: "PUBLISHED" } }
            ];

            const response = await opensearchClient.search({
                index: ES_MATCHING_INDICES.JOBS,
                size: limit,
                body: {
                    query: {
                        bool: {
                            must: mustClauses,
                            should: shouldClauses.length > 0 ? shouldClauses : [{ match_all: {} }],
                            minimum_should_match: shouldClauses.length > 0 ? 1 : 0
                        }
                    }
                }
            });

            const searchBody: any = response.body ?? response;
            const hits = searchBody?.hits?.hits || [];
            return hits.map((hit: any) => hit._id || hit._source?.id).filter(Boolean);
        } catch (error) {
            logger.warn({ err: error, candidateId: candidate.id }, "[MatchingOpenSearch] OpenSearch job search failed; returning empty for SQL fallback.");
            return [];
        }
    }
}
